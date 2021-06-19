const exclude_attributes = ['created_at', 'updated_at', 'file']
const file_exclude_attributes = ['id', 'created_at', 'updated_at']

		const urlParams = new URLSearchParams(window.location.search)
		const imageId = urlParams.get("image")
    document.getElementById("image").src = "/api/images/" + imageId + "/show"
    fetch("/api/images/" + imageId)
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        const tab = document.getElementById("table")
        let row = document.createElement("tr")
            let keycell = document.createElement("td")
            keycell.innerHTML = '<b>Image Info:</b>'
            keycell.style.textAlign = "center"
            let valuecell = document.createElement("td")
            valuecell.innerHTML = ''
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
        for (const key in info) {
          if (info.hasOwnProperty(key) && exclude_attributes.indexOf(key) == -1) {
            row = document.createElement("tr")
            keycell = document.createElement("td")
            keycell.innerHTML = key
            keycell.style.textAlign = "center"
            valuecell = document.createElement("td")
            valuecell.innerHTML = info[key]
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
          }
        }
        for (const key in info.file) {
          if (info.file.hasOwnProperty(key) && file_exclude_attributes.indexOf(key) == -1) {
            row = document.createElement("tr")
            keycell = document.createElement("td")
            keycell.innerHTML = key
            keycell.style.textAlign = "center"
            valuecell = document.createElement("td")
            valuecell.innerHTML = info.file[key]
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
          }
        }
      })
