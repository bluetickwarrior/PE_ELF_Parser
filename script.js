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

    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileType = document.getElementById('fileType').value;
        const password = document.getElementById('passwordInput').value;
        const inputType = document.querySelector('input[name="inputType"]:checked').value;
        
        if (fileType !== 'pe' && fileType !== 'elf' && fileType !== 'macho') {
            document.getElementById('result').innerHTML = '<p>Error: Invalid file type selected. Please choose PE, ELF, or Mach-O.</p>';
            return;
        }

        const formData = new FormData();
        formData.append('type', fileType);
        formData.append('password', password);

        if (inputType === 'file') {
            const file = fileInput.files[0];
            if (!file) {
                document.getElementById('result').innerHTML = '<p>Error: Please select a file to upload.</p>';
                return;
            }
            formData.append('file', file);
        } else {
            const base64Content = base64Input.value.trim();
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
            
            //const data = await response.json();
            document.getElementById('metadata-result').innerHTML = metadataHTML;
            document.getElementById('capa-result').innerHTML = capaHTML;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('metadata-result').innerHTML = `<p>Error: ${error.message}</p>`;
            document.getElementById('capa-result').innerHTML = '';
        }
    });
});

            
            //document.getElementById('result').innerHTML = `
                //<h2>Metadata:</h2>
                //<pre>${JSON.stringify(data, null, 2)}</pre>
            //`;
        //} catch (error) {
            //console.error('Error:', error);
            //document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
        //}
    //});
//});
