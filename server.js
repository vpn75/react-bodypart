const express = require('express');
const path = require('path');

const port = process.env.PORT || 8000;
const app = express();
const wwwroot = __dirname+'/build';
app.use(express.static(wwwroot));

app.get('*', (req, res) => {
	res.sendFile(path.resolve(wwwroot, 'index.html'))
});

app.listen(port, () => {
	console.log("App running on http://localhost:" + port);
});