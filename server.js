const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
//
app.use(express.static(path.join(__dirname, '/public')))
app.get('/*', (req, res) => {
	// fs.readFile(path.join(__dirname, '/public/index.html'), 'utf8', (err, data) => {
	// 	if(err) throw err;
	// 	res.send(data);
	// })
	res.sendFile(path.join(__dirname, '/public'))
})

app.listen(process.env.PORT || 500, () => {
	console.log(`Server started on ${process.env.PORT || 500}`);
})