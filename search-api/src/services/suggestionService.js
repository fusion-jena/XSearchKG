import { NamedNode, Variable } from 'rdf-data-factory';
import config from '../config/config';
import Query, { BgpPattern, FilterPattern, OperationExpression, OptionalPattern } from '../utils/Query';

export const generateTargets = async (label, target) => {
	const values = [];
	if (typeof target !== 'undefined') {
		values.push({ type: target });
	}
	return await generateSuggestions(SuggestionType.SchemaNode, config.targets.maxSuggestions, label, values);
};

export const generateKeywords = async (label, keywords) => {
	return await generateSuggestions(SuggestionType.InstanceNode, config.keywords.maxSuggestions, label, keywords);
};

const generateSuggestions = async (suggestionType, limit, label, values) => {
	const query = new Query();
	query.addVariables('type');
	if (suggestionType === SuggestionType.InstanceNode) {
		query.addVariables('iri');
	}
	query.fromDefault(new NamedNode(config.queryGeneration.namedGraphIRI.instance));
	query.addWhereClause(BgpPattern.createTwoVarBgp('iri', config.queryGeneration.instanceOf, 'type'));
	if (label) {
		query.addWhereClause(OptionalPattern.createTwoVarOptional(suggestionType, config.queryGeneration.label, 'name'));
		query.addWhereClause(nameFilter(label, suggestionType));
	}
	if (values?.length > 0) {
		query.bindVariable(suggestionType, values.map(value => value[suggestionType]));
	}
	query.addWhereClause(FilterPattern.createBlankNodeFilter('iri'));
	query.limit(limit);
	return await query.execute();
};

const nameFilter = (name, suggestionType) => {
	const nameRegex = OperationExpression.createRegex('name', '\\b' + name);
	const orOperation = new OperationExpression('||', nameRegex, fallbackIriRegex(name, suggestionType));
	return new FilterPattern(orOperation);
};

const fallbackIriRegex = (name, suggestionType) => {
	// this fallback is neccessary, because Mondial does not provide all nodes with labels
	const nameNotBoundExpression = new OperationExpression('!', new OperationExpression('bound', new Variable('name')));
	const iriRegex1 = OperationExpression.createRegex(suggestionType, '\\/' + name + '[^\\/]*\\/');
	const iriRegex2 = OperationExpression.createRegex(suggestionType, '#' + name);
	return new OperationExpression('&&', nameNotBoundExpression, new OperationExpression('||', iriRegex1, iriRegex2));
};

const SuggestionType = {
	InstanceNode: 'iri',
	SchemaNode: 'type'
}
