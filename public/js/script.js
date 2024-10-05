function checkSeedPhrase() {
    const seedPhrase = document.getElementById('seed-phrase').value;

    fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seedPhrase }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('page-title').value = data.data.title;
            document.getElementById('meta-description').value = data.data.meta;
            document.getElementById('page-body').value = data.data.body;
            document.getElementById('editor').classList.remove('hidden');
        } else {
            alert(data.message);
        }
    });
}

function saveChanges() {
    const seedPhrase = document.getElementById('seed-phrase').value;
    const title = document.getElementById('page-title').value;
    const meta = document.getElementById('meta-description').value;
    const body = document.getElementById('page-body').value;

    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seedPhrase, title, meta, body }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
}
