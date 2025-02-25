document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('fileInput').files[0];
    const fileType = document.getElementById('fileType').value;
    
    // Check if the selected file type is valid
    if (fileType !== 'pe' && fileType !== 'elf') {
        document.getElementById('result').innerHTML = '<p>Error: Invalid file type selected. Please choose PE or ELF.</p>';
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);

    try {
        const response = await fetch('https://y39ouvotwl.execute-api.us-east-1.amazonaws.com/prod', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('result').innerHTML = `
            <h2>Metadata:</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
