import { Literal, NamedNode, Variable } from 'rdf-data-factory';
import { Generator, Parser } from 'sparqljs';
import config from '../config/config';
import { tripleStoreRequest } from '../services/queryService';

const parser = new Parser({ prefixes: config.sparql.prefixes });
const generator = new Generator({ prefixes: config.sparql.prefixes });

export const blankNodeCheckedPrefix = 'nonblank_';

class Query {
	constructor(queryText) {
		if (queryText) {
			this.query = parser.parse(queryText);
		} else {
			this.query = {
				prefixes: config.sparql.prefixes,
				queryType: 'SELECT',
				distinct: true,
				variables: [],
				where: [],
				type: 'query'
			};
		}
	}

	addVariables = (...variableNames) => {
		const variables = variableNames.map((variableName) => new Variable(variableName));
		this.query.variables.push(...variables);
	};

	addVariableExpression = (variableExpression) => {
		this.query.variables.push(variableExpression);
	};

	fromDefault = (...sources) => {
		this.query.from = {
			default: sources
		};
	};

	addWhereClause = (clause) => {
		this.query.where.push(clause);
	};

	static variableName = (iri, target, hasOutgoingLoop) => iri.replace(/[^a-zA-Z0-9]/g, '') + (hasOutgoingLoop && iri !== target ? 'COPY' : '');

	bindVariable = (variableName, iris) => {
		this.query.where.push({
			type: 'values',
			values: iris.map((iri) => {
				const binding = {};
				binding['?' + variableName] = new NamedNode(iri);
				return binding;
			})
		});
	};

	bindTarget = (iri) => this.bindVariable('target', iri);

	limit = (limit) => {
		this.query.limit = limit;
	};

	execute = async (endpoint = config.queryGeneration.endpoint) => {
		const queryText = generator.stringify(this.query);
		return await tripleStoreRequest(queryText, endpoint);
	};
}

export class BgpPattern {
	constructor(...triples) {
		this.type = 'bgp';
		this.triples = triples;
	};

	static createObjVarBgp = (subjectIri, predicateIri, objectName) => {
		const triple = Triple.createObjVarTriple(subjectIri, predicateIri, objectName);
		return new BgpPattern(triple);
	};

	static createSubjVarBgp = (subjectName, predicateIri, objectIri) => {
		const triple = Triple.createSubjVarTriple(subjectName, predicateIri, objectIri);
		return new BgpPattern(triple);
	};

	static createTwoVarBgp = (subjectName, predicateIri, objectName) => {
		const triple = Triple.createTwoVarTriple(subjectName, predicateIri, objectName);
		return new BgpPattern(triple);
	};
};

export class FilterPattern {
	constructor(expression) {
		this.type = 'filter';
		this.expression = expression;
	};

	static createLanguageFilter = (variableName, language) => {
		const variable = new Variable(variableName);
		const langOperation = new OperationExpression('lang', variable);
		const languageLiteral = new Literal(language);
		const equalOperation = new OperationExpression('=', langOperation, languageLiteral);
		return new FilterPattern(equalOperation);
	};

	static createBlankNodeFilter = (variableName) => {
		const variable = new Variable(variableName);
		const isBlankExpression = new OperationExpression('isblank', variable);
		const isNotBlankExpression = new OperationExpression('!', isBlankExpression);
		return new FilterPattern(isNotBlankExpression);
	};
};

export class OperationExpression {
	constructor(operator, ...args) {
		this.type = 'operation';
		this.operator = operator;
		this.args = args;
	};

	static createRegex = (node, filter) => {
		const nodeVariable = new Variable(node);
		const filterLiteral = new Literal(filter);
		const caseInsensitiveLiteral = new Literal('i');
		return new OperationExpression('regex', nodeVariable, filterLiteral, caseInsensitiveLiteral);
	};

	static createStringStartsFilter = (property, filter) => {
		const propertyVariable = new Variable(property);
		const nameLowerCaseExpression = new OperationExpression('lcase', propertyVariable);
		const filterLiteral = new Literal(filter);
		const filterLowerCaseExpression = new OperationExpression('lcase', filterLiteral);
		return new OperationExpression('strstarts', nameLowerCaseExpression, filterLowerCaseExpression);
	};

	static createBlankNodeFilteredVariable = (variableName) => {
		return {
			expression: new OperationExpression(
				'if',
				new OperationExpression('isblank', new Variable(variableName)),
				new Literal(''),
				new Variable(variableName)
			),
			variable: new Variable(blankNodeCheckedPrefix + variableName)
		};
	};
};

export class OptionalPattern {
	constructor(...patterns) {
		this.type = 'optional';
		this.patterns = patterns;
	};

	static createTwoVarOptional = (subjectName, predicateIri, objectName) => {
		const bgpPattern = BgpPattern.createTwoVarBgp(subjectName, predicateIri, objectName);
		return new OptionalPattern(bgpPattern);
	};
};

export class Triple {
	constructor(subject, predicate, object) {
		this.subject = subject;
		this.predicate = predicate;
		this.object = object;
	};

	static createObjVarTriple = (subjectIri, predicateIri, objectName) => {
		const subjectNode = new NamedNode(subjectIri);
		const predicateNode = new NamedNode(getFullIri(predicateIri));
		const objectVar = new Variable(objectName);
		return new Triple(subjectNode, predicateNode, objectVar);
	};

	static createSubjVarTriple = (subjectName, predicateIri, objectIri) => {
		const subjectVar = new Variable(subjectName);
		const predicateNode = new NamedNode(getFullIri(predicateIri));
		const objectNode = new NamedNode(objectIri);
		return new Triple(subjectVar, predicateNode, objectNode);
	};

	static createTwoVarTriple = (subjectName, predicateIri, objectName) => {
		const subjectVar = new Variable(subjectName);
		const predicateNode = new NamedNode(getFullIri(predicateIri));
		const objectVar = new Variable(objectName);
		return new Triple(subjectVar, predicateNode, objectVar);
	};
};

export class ValuesPattern {
	constructor(...values) {
		this.type = 'values';
		this.values = values;
	};

	static createBinding = (variableName, iri) => {
		const node = new NamedNode(iri);
		const binding = new ValuesPatternRow(variableName, node);
		return new ValuesPattern(binding);
	};
};

export class ValuesPatternRow {
	constructor(variableName, term) {
		this['?' + variableName] = term;
	};
};

const getFullIri = (iri) => {
	const iriParts = iri.split(':');
	const prefixCandidate = iriParts[0];
	if (iriParts.length === 2 && config.sparql.prefixes.hasOwnProperty(prefixCandidate)) {
		return config.sparql.prefixes[prefixCandidate] + iriParts[1];
	}
	return iri;
};

export default Query;
