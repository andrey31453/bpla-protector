async function get_data(url) {
	return await fetch(url).then((response) => response.json())
}
