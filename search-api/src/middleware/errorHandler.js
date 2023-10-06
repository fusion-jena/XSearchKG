const serverError = (error, req, res, next) => {
	console.error('Internal Server Error', error);
	return res.status(500).json({ message: 'Something went wrong' });
};

export default serverError;
