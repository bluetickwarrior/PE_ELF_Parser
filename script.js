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
            // Prepare the result HTML
            let resultHTML = '<h2>Metadata:</h2>';
            resultHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';

            // Add non-JSON part if it exists
            if (nonJsonPart && nonJsonPart.trim()) {
                resultHTML += '<h2>capa analysis:</h2>';
                resultHTML += '<pre>' + nonJsonPart.trim() + '</pre>';
            }
            
            //const data = await response.json();
            document.getElementById('result').innerHTML = resultHTML;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
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
