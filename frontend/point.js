const exclude_attributes = ['video', 'id', 'video_id', 'created_at', 'updated_at']
    const video_exclude_attributes = ['id', 'file_id', 'file', 'created_at', 'updated_at']
    const file_exclude_attributes = ['id', 'created_at', 'updated_at']

		const urlParams = new URLSearchParams(window.location.search)
		const pointId = urlParams.get("point")
    fetch("/api/datapoints/" + pointId)
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        const tab = document.getElementById("table")
        let row = document.createElement("tr")
            let keycell = document.createElement("td")
            keycell.innerHTML = '<b>Datapoint Info:</b>'
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
        row = document.createElement("tr")
            keycell = document.createElement("td")
            keycell.innerHTML = '<b>Video Info:</b>'
            keycell.style.textAlign = "center"
            valuecell = document.createElement("td")
            valuecell.innerHTML = ''
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
        for (const key in info.video) {
          if (info.video.hasOwnProperty(key) && video_exclude_attributes.indexOf(key) == -1) {
            row = document.createElement("tr")
            keycell = document.createElement("td")
            keycell.innerHTML = key
            keycell.style.textAlign = "center"
            valuecell = document.createElement("td")
            valuecell.innerHTML = info.video[key]
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
          }
        }
        for (const key in info.video.file) {
          if (info.video.file.hasOwnProperty(key) && file_exclude_attributes.indexOf(key) == -1) {
            row = document.createElement("tr")
            keycell = document.createElement("td")
            keycell.innerHTML = key
            keycell.style.textAlign = "center"
            valuecell = document.createElement("td")
            valuecell.innerHTML = info.video.file[key]
            valuecell.style.textAlign = "center"
            row.appendChild(keycell)
            row.appendChild(valuecell)
            tab.appendChild(row)
          }
        }
        const link = document.createElement("a")
        link.href = "video.html?video=" + info.video_id + "&time=" + info.start_seconds
        let cont = document.getElementById('imageContainer')
        cont.appendChild(link)
        const img = document.createElement("img")
        img.src = "/api/datapoints/" + info.id + "/thumbnail"
        link.appendChild(img)
        document.getElementById("loadingAnimation").remove()
      })
