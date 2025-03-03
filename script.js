document.addEventListener('DOMContentLoaded', function() {
    const fileInputContainer = document.getElementById('fileInputContainer');
    const base64InputContainer = document.getElementById('base64InputContainer');
    const fileInput = document.getElementById('fileInput');
    const base64Input = document.getElementById('base64Input');

    document.querySelectorAll('input[name="inputType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'file') {
                fileInputContainer.style.display = 'block';
                base64InputContainer.style.display = 'none';
                fileInput.required = true;
                base64Input.required = false;
            } else {
                fileInputContainer.style.display = 'none';
                base64InputContainer.style.display = 'block';
                fileInput.required = false;
                base64Input.required = true;
            }
        });
    });

    const loading = document.getElementById('loading');
    function showLoading() {
        loading.style.display = 'block';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    async function readFileHeader(file) {
        const slice = file.slice(0, 2);
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = (e) => {
                const header = e.target.result;
                resolve(header);
            };
            reader.readAsText(slice);
        });
    }

    async function removeFileHeader(file) {
        const modifiedContent = file.slice(2);
        return new File([modifiedContent], file.name, { type: file.type });
    }

    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileType = document.getElementById('fileType').value;
        const password = document.getElementById('passwordInput').value;
        const inputType = document.querySelector('input[name="inputType"]:checked').value;
        
        if (fileType !== 'pe' && fileType !== 'elf' && fileType !== 'macho') {
            document.getElementById('metadata-result').innerHTML = '<p>Error: Invalid file type selected. Please choose PE, ELF, or Mach-O.</p>';
            return;
        }

        const formData = new FormData();
        formData.append('type', fileType);
        formData.append('password', password);

        if (inputType === 'file') {
            let file = fileInput.files[0];
            if (!file) {
                document.getElementById('metadata-result').innerHTML = '<p>Error: Please select a file to upload.</p>';
                document.getElementById('capa-result').innerHTML = '';
                document.getElementById('result-container').style.display = 'flex';
                return;
            }

            // Check if the file is a ZIP or 7z archive
            const fileHeader = await readFileHeader(file);
            if (fileHeader === 'PK' || fileHeader === '7z') {
                file = await removeFileHeader(file);
            }

            formData.append('file', file);
        } else {
            const base64Content = base64Input.value.trim();
            if (!base64Content) {
                document.getElementById('metadata-result').innerHTML = '<p>Error: Please paste the base64-encoded file contents.</p>';
                document.getElementById('capa-result').innerHTML = '';
                document.getElementById('result-container').style.display = 'flex';
                return;
            }
            formData.append('base64', base64Content);
        }

        showLoading(); // Show loading animation before making the request

        try {
            const response = await fetch('https://y39ouvotwl.execute-api.us-east-1.amazonaws.com/prod', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            
            // Split the response using the '|||' delimiter
            const [jsonPart, nonJsonPart] = text.split('|||');

            // Parse the JSON part
            const data = JSON.parse(jsonPart);
            // Prepare the metadata HTML
            let metadataHTML = '<h2>Metadata:</h2>';
            metadataHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';

            // Prepare the capa analysis HTML
            let capaHTML = '<h2>capa analysis:</h2>';
            if (nonJsonPart && nonJsonPart.trim()) {
                capaHTML += '<pre>' + nonJsonPart.trim() + '</pre>';
            } else {
                capaHTML += '<p>No capa analysis available.</p>';
            }
            
            document.getElementById('metadata-result').innerHTML = metadataHTML;
            document.getElementById('capa-result').innerHTML = capaHTML;
            // Show the result container
            document.getElementById('result-container').style.display = 'flex';
            
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('metadata-result').innerHTML = `<p>Error: ${error.message}</p>`;
            document.getElementById('capa-result').innerHTML = '';
            
            // Show the result container even in case of error
            document.getElementById('result-container').style.display = 'flex';
        } finally {
            hideLoading(); // Hide loading animation
        }
    });
});
