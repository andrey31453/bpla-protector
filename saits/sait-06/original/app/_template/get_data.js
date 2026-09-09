// скачка json с url
const get_data = async (url) => {
	return await fetch(url)
		.then((response) => response.json())
		.then((response) => response.data)
}
