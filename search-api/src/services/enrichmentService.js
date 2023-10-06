import nlp from 'compromise';
import config from '../config/config';
import { knowledgeGraph } from '../config/knowledgeGraphs';
import cacheWrapper from '../middleware/cacheWrapper';
import Query, { BgpPattern, FilterPattern } from '../utils/Query';

const queryGeneration = config.queryGeneration;

export const type = async (iri) => await property(iri, 'instanceOf');

export const isBlankNode = async (iri) => {
	const query = new Query();
	query.addVariables('value');
	query.addWhereClause(BgpPattern.createSubjVarBgp('value', queryGeneration.instanceOf, iri));
	query.addWhereClause(FilterPattern.createBlankNodeFilter('value'));
	query.limit(1);
	return query.execute().then((response) => {
			return response.length === 0;
	}).catch((error) => {
		console.error(error);
	});
};

export const name = async (iri) => await propertyWithSameAsFallback(iri, 'label', true) || nameFromIri(iri);

export const description = async (iri) => await propertyWithSameAsFallback(iri, 'comment', true);

export const image = async (iri) => await propertyWithSameAsFallback(iri, 'image');

export const sameAs = async (iri) => await property(iri, 'sameAs');

export const edgeName = async (iri, inverseDirection, typeIri) => await cacheWrapper(async (iri, inverseDirection, typeIri) => {
		let edgeLabel;
		if (inverseDirection) {
			const inverseIri = await inverseOf(iri);
			if (inverseIri) {
				edgeLabel = await directEdgeName(inverseIri);
			} else {
				edgeLabel = await inverseEdgeName(iri);
			}
		} else {
			edgeLabel = await directEdgeName(iri);
		}
		// remove the type name, because we already print it after the edge name
		const typeName = await name(typeIri);
		return removeTrailing(edgeLabel, typeName).trim();
	}, 'edgeName')(iri, inverseDirection, typeIri);

const inverseOf = async (iri) => await property(iri, 'inverseOf');

const propertyWithSameAsFallback = async (iri, configProperty, useLanguageFilter) => await property(iri, configProperty) || await sameAsProperty(iri, configProperty, useLanguageFilter);

const property = async (iri, configProperty, useLanguageFilter = false, knowledgeGraph = queryGeneration) => {
	const property = knowledgeGraph?.[configProperty];
	if (iri && property) {
		const query = new Query();
		query.addVariables('value');
		query.addWhereClause(BgpPattern.createObjVarBgp(iri, property, 'value'));
		if (useLanguageFilter) {
			query.addWhereClause(FilterPattern.createLanguageFilter('value', 'en'));
		}
		query.limit(1);
		return query.execute(knowledgeGraph.endpoint).then((response) => {
			return response[0]?.value;
		}).catch((error) => {
			console.error(error);
		});
	}
};

const sameAsProperty = async (iri, configProperty, useLanguageFilter) => {
	const sameAsIri = await property(iri, 'sameAs');
	const sameAsKnowledgeGraph = knowledgeGraph(sameAsIri);
	return await property(sameAsIri, configProperty, useLanguageFilter, sameAsKnowledgeGraph);
};

// needed for mondial, because only few resources have labels
const nameFromIri = (iri) => {
	if (!iri) {
		return iri;
	}
	iri = iri.replace(queryGeneration.namespaces.namespaceSchemaClass, '');
	iri = iri.replace(queryGeneration.namespaces.namespaceEntity, '');
	iri = removeTrailing(iri, '/');
	iri = removeTrailing(iri, '-');
	iri = iri.split('/').pop(); // only consider last path segment
	iri = iri.replaceAll('+', ' ');
	return iri.replace(/([a-z])([A-Z])/g, '$1 $2'); // split on camel case
};

const directEdgeName = async (iri) => {
	const rawName = (await name(iri)).toLowerCase();
	const document = nlp(rawName);
	if (isExistenceProperty(document) || isPossessionProperty(document)) {
		return document.text();
	}
	if (isNounProperty(document) || isPrepositionWithNounProperty(document)) {
		return 'has ' + document.not('#Preposition').text();
	}
	if (isNounWithPrepositionProperty(document) || isParticipleProperty(document)) {
		return 'is ' + document.text() + (document.has('(#Preposition|#Particle)') ? '' : ' by');
	}
	return document.text();
};

const inverseEdgeName = async (iri) => {
	const rawName = (await name(iri)).toLowerCase();
	const document = nlp(rawName);
	// change existence to possession property
	if (isExistenceProperty(document)) {
		return (isPastTenseProperty(document) ? 'had ' : 'has ') + document.sentences().toPresentTense().not('is').not('of').text();
	}
	if (isNounWithPrepositionProperty(document)) {
		return 'has ' + document.match('(#Adjective|#Noun)').text();
	}
	// change possession to existence property
	if (isPossessionProperty(document)) {
		return (isPastTenseProperty(document) ? 'was ' : 'is ') + document.sentences().toPresentTense().not('has').text() + ' of';
	}
	if (isNounProperty(document)) {
		return 'is ' + document.text() + ' of';
	}
	// change passive to active voice
	if (isPastTenseProperty(document)) {
		return document.verbs().toPresentTense().not('is').not('#Particle').text();
	}
	// change active to passive voice
	if (isPresentTenseProperty(document)) {
		return 'is ' + document.sentences().toPastTense().text() + ' by';
	}
	return 'is ' + document.text() + ' of';
};

const isExistenceProperty = (document) => document.clone().verbs().toPresentTense().has('is');

const isPossessionProperty = (document) => document.clone().verbs().toPresentTense().has('has');

const isNounProperty = (document) => document.match('(#Adjective|#Noun)').wordCount() === document.wordCount() || document.text().endsWith(' info');

const isPrepositionWithNounProperty = (document) => document.match('(#Adjective|#Noun)').wordCount() === document.wordCount() - 1 && document.firstTerms().has('#Preposition');

const isNounWithPrepositionProperty = (document) => document.match('(#Adjective|#Noun)').wordCount() === document.wordCount() - 1 && document.lastTerms().has('#Preposition');

const isParticipleProperty = (document) => document.firstTerms().has('(#Participle|#PastTense)') && !document.firstTerms().has('#Copula') && !document.lastTerms().has('#Noun');

const isPastTenseProperty = (document) => document.has('#PastTense');

const isPresentTenseProperty = (document) => document.has('#PresentTense');

const removeTrailing = (inputString, endString) => inputString.toLowerCase().endsWith(endString.toLowerCase()) ? inputString.slice(0, inputString.length - endString.length) : inputString;
