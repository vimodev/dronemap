const exclude_attributes = ['created_at', 'updated_at', 'file']
const file_exclude_attributes = ['id', 'created_at', 'updated_at']

// Get the point id from the url params
function getImageId() {
  return (new URLSearchParams(window.location.search)).get("image")
}

// Fetch the point from the backend
async function fetchImageInformation(pointId) {
  return await new Promise((resolve) => {
    fetch("/api/images/" + pointId)
      .then(function (response) {
        return response.json()
      })
      .then(function (info) {
        return resolve(info)
      })
  })
}

// Append a key and a value to the info table
function appendKeyValue(key, value) {
  const tab = document.getElementById("table")
  const row = document.createElement("tr")
  const keycell = document.createElement("td")
  keycell.innerHTML = key
  keycell.style.textAlign = "center"
  const valuecell = document.createElement("td")
  valuecell.innerHTML = value
  valuecell.style.textAlign = "center"
  row.appendChild(keycell)
  row.appendChild(valuecell)
  tab.appendChild(row)
}

// Populate the page with information
function populate(info) {
  appendKeyValue('<b>Image Info:</b>', '')
  for (const key in info) {
    if (info.hasOwnProperty(key) && exclude_attributes.indexOf(key) == -1) {
      appendKeyValue(key, info[key])
    }
  }
  for (const key in info.file) {
    if (info.file.hasOwnProperty(key) && file_exclude_attributes.indexOf(key) == -1) {
      appendKeyValue(key, info.file[key])
    }
  }
  const img = document.getElementById("image")
  img.src = "/api/images/" + info.id + "/show"
}

const image_id = getImageId()
const image = fetchImageInformation(image_id)
image.then(populate)
