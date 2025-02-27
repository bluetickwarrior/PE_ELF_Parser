document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileType = document.getElementById('fileType').value;
    const password = document.getElementById('passwordInput').value;
    const inputType = document.querySelector('input[name="inputType"]:checked').value;
    
    // Check if the selected file type is valid
    if (fileType !== 'pe' && fileType !== 'elf' && fileType !== 'macho') {
        document.getElementById('result').innerHTML = '<p>Error: Invalid file type selected. Please choose PE, ELF, or Mach-O.</p>';
        return;
    }

    const formData = new FormData();
    formData.append('type', fileType);
    formData.append('password', password);

    if (inputType === 'file') {
        const file = document.getElementById('fileInput').files[0];
        if (!file) {
            document.getElementById('result').innerHTML = '<p>Error: Please select a file to upload.</p>';
            return;
        }
        formData.append('file', file);
    } else {
        const base64Content = document.getElementById('base64Input').value.trim();
        if (!base64Content) {
            document.getElementById('result').innerHTML = '<p>Error: Please paste the base64-encoded file contents.</p>';
            return;
        }
        formData.append('base64', base64Content);
    }

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

// Add event listeners to show/hide appropriate input fields
document.querySelectorAll('input[name="inputType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'file') {
            document.getElementById('fileInputContainer').style.display = 'block';
            document.getElementById('base64InputContainer').style.display = 'none';
            document.getElementById('fileInput').required = true;
            document.getElementById('base64Input').required = false;
        } else {
            document.getElementById('fileInputContainer').style.display = 'none';
            document.getElementById('base64InputContainer').style.display = 'block';
            document.getElementById('fileInput').required = false;
            document.getElementById('base64Input').required = true;
        }
    });
});
