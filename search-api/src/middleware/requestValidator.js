export const validateKeywords = (req, res, next) => {
	const { keywords } = req.query;
	if (keywords?.split(',').some(keyword => !isValidIri(keyword))) {
		return res.status(400).json({ message: 'keywords parameter is not valid' });
	}
	next();
};

export const validateTarget = (req, res, next) => {
	const { target } = req.query;
	if (!target) {
		return res.status(400).json({ message: 'target parameter is required' });
	}
	if (!isValidIri(target)) {
		return res.status(400).json({ message: 'target parameter is not valid' });
	}
	next();
};

export const validateK = (req, res, next) => {
	const { k } = req.query;
	if (k && isNaN(Number(k))) {
		return res.status(400).json({ message: 'k parameter is not valid' });
	}
	next();
};

export const validateDisabledConnections = (req, res, next) => {
	const { disabledConnections } = req.query;
	if (disabledConnections?.split(',').some(disabledConnection => isNaN(Number(disabledConnection)))) {
		return res.status(400).json({ message: 'disabledConnections parameter is not valid' });
	}
	next();
};

export const validatePage = (req, res, next) => {
	const { page } = req.query;
	if (page && isNaN(Number(page))) {
		return res.status(400).json({ message: 'page parameter is not valid' });
	}
	next();
};

export const validateIri = (req, res, next) => {
	const { iri } = req.query;
	if (!iri) {
		return res.status(400).json({ message: 'iri parameter is required' });
	}
	if (!isValidIri(iri)) {
		return res.status(400).json({ message: 'iri parameter is not valid' });
	}
	next();
};

// check iri in order to avoid SPARQL injection
const isValidIri = (iri) => {
	return !decodeURIComponent(iri).includes('>');
}
