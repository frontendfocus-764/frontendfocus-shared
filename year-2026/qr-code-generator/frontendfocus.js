 // Initialize icons
        lucide.createIcons();

        // State variables
        let activeTab = 'url';
        let currentQrData = '';

        // UI Elements
        const qrContainer = document.getElementById('qr-container');
        const qrEmptyState = document.getElementById('qr-empty-state');
        const qrActiveState = document.getElementById('qr-active-state');
        const actionButtons = document.getElementById('action-buttons');
        const dataDisplayContainer = document.getElementById('data-display-container');
        const qrDataText = document.getElementById('qr-data-text');
        const sectionTitle = document.getElementById('section-title');

        // Inputs
        const urlInput = document.getElementById('url-val');
        const textInput = document.getElementById('text-val');
        
        // Contact Inputs
        const cFname = document.getElementById('contact-fname');
        const cLname = document.getElementById('contact-lname');
        const cNickname = document.getElementById('contact-nickname');
        const cPhone = document.getElementById('contact-phone');
        const cEmail = document.getElementById('contact-email');
        const cTitle = document.getElementById('contact-title');
        const cDept = document.getElementById('contact-dept');
        const cOrg = document.getElementById('contact-org');
        const cAddress = document.getElementById('contact-address');
        const cUrl = document.getElementById('contact-url');
        const cNotes = document.getElementById('contact-notes');

        // Add event listeners to all inputs
        const allInputs = [
            urlInput, textInput, cFname, cLname, cNickname, 
            cPhone, cEmail, cTitle, cDept, cOrg, cAddress, cUrl, cNotes
        ];
        
        allInputs.forEach(input => {
            input.addEventListener('input', generateDataFlow);
        });

        function switchTab(tabId) {
            activeTab = tabId;
            
            // Update Tab Styling
            const tabs = ['url', 'text', 'contact'];
            tabs.forEach(t => {
                const btn = document.getElementById(`tab-btn-${t}`);
                if(t === tabId) {
                    btn.classList.remove('tab-inactive');
                    btn.classList.add('tab-active');
                } else {
                    btn.classList.remove('tab-active');
                    btn.classList.add('tab-inactive');
                }
                document.getElementById(`input-${t}`).classList.add('hidden');
                document.getElementById(`input-${t}`).classList.remove('block');
            });

            // Show active section
            document.getElementById(`input-${tabId}`).classList.remove('hidden');
            document.getElementById(`input-${tabId}`).classList.add('block');

            // Update Title
            if(tabId === 'url') sectionTitle.innerText = 'Enter URL';
            if(tabId === 'text') sectionTitle.innerText = 'Enter Text';
            if(tabId === 'contact') sectionTitle.innerText = 'Contact Information';

            generateDataFlow();
        }

        function formatUrl(url) {
            if (!url.trim()) return '';
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'https://' + url;
            }
            return url;
        }

        function generateVCard() {
            // Check if at least one critical field is filled
            if (!cFname.value && !cLname.value && !cPhone.value && !cEmail.value && !cOrg.value) return '';
            
            let vcard = `BEGIN:VCARD\nVERSION:3.0`;
            
            // Name mapping
            vcard += `\nN:${cLname.value};${cFname.value};;;`;
            vcard += `\nFN:${cFname.value} ${cLname.value}`.trim();
            
            if (cNickname.value) vcard += `\nNICKNAME:${cNickname.value}`;
            
            // Phone and Email
            if (cPhone.value) vcard += `\nTEL:${cPhone.value}`;
            if (cEmail.value) vcard += `\nEMAIL:${cEmail.value}`;
            
            // Organization & Professional Details
            if (cOrg.value || cDept.value) {
                // vCard format for org is "Company;Department"
                vcard += `\nORG:${cOrg.value};${cDept.value}`;
            }
            if (cTitle.value) vcard += `\nTITLE:${cTitle.value}`;
            
            // Address (removing line breaks for standard vcard mapping)
            if (cAddress.value) {
                const cleanAddress = cAddress.value.replace(/\n/g, ', ');
                vcard += `\nADR:;;${cleanAddress};;;;`;
            }
            
            if (cUrl.value) vcard += `\nURL:${cUrl.value}`;
            
            // Notes (escaping newlines to literally say \n in the vcard)
            if (cNotes.value) {
                const cleanNotes = cNotes.value.replace(/\n/g, '\\n');
                vcard += `\nNOTE:${cleanNotes}`;
            }
            
            vcard += `\nEND:VCARD`;
            return vcard;
        }

        function generateDataFlow() {
            let data = '';
            
            if (activeTab === 'url') {
                data = formatUrl(urlInput.value);
            } else if (activeTab === 'text') {
                data = textInput.value;
            } else if (activeTab === 'contact') {
                data = generateVCard();
            }

            currentQrData = data;

            if (data.trim() === '') {
                qrEmptyState.classList.remove('hidden');
                qrActiveState.classList.add('hidden');
                actionButtons.classList.add('hidden');
                actionButtons.classList.remove('flex');
                dataDisplayContainer.classList.add('hidden');
                qrContainer.innerHTML = '';
            } else {
                qrEmptyState.classList.add('hidden');
                qrActiveState.classList.remove('hidden');
                actionButtons.classList.remove('hidden');
                actionButtons.classList.add('flex');
                dataDisplayContainer.classList.remove('hidden');
                
                qrDataText.innerText = data;
                createQR(data);
            }
        }

        function createQR(text) {
            qrContainer.innerHTML = '';
            
            try {
                const canvas = document.createElement('canvas');
                qrContainer.appendChild(canvas);
                
                new QRious({
                    element: canvas,
                    value: text,
                    size: 300,
                    background: 'white',
                    foreground: 'black',
                    level: 'L' // Switched to Low error correction so the QR isn't too dense with large vCards
                });
                
                canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
                canvas.style.maxWidth = '300px';
                
            } catch (error) {
                console.error('Error creating QR code, using fallback:', error);
                generateFallbackQR(text);
            }
        }

        function generateFallbackQR(text) {
            qrContainer.innerHTML = '';
            
            const img = document.createElement('img');
            const encodedData = encodeURIComponent(text);
            img.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodedData}&choe=UTF-8`;
            img.alt = 'Generated QR Code';
            img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
            img.style.maxWidth = '300px';
            
            img.onerror = () => {
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=png&margin=10`;
            };
            
            qrContainer.appendChild(img);
        }

        function downloadQRCode() {
            if (!currentQrData) return;
            
            const canvas = qrContainer.querySelector('canvas');
            const img = qrContainer.querySelector('img');
            const link = document.createElement('a');
            link.download = `qr-code-${activeTab}.png`;
            
            if (canvas) {
                link.href = canvas.toDataURL();
                link.click();
            } else if (img) {
                fetch(img.src)
                  .then(response => response.blob())
                  .then(blob => {
                      const blobUrl = window.URL.createObjectURL(blob);
                      link.href = blobUrl;
                      link.click();
                      window.URL.revokeObjectURL(blobUrl);
                  })
                  .catch(e => {
                      link.href = img.src;
                      link.click();
                  });
            }
        }

        async function copyToClipboard() {
            if (!currentQrData) return;
            
            try {
                await navigator.clipboard.writeText(currentQrData);
                
                const copyBtnText = document.getElementById('copy-text');
                const copyBtnIcon = document.getElementById('copy-icon');
                
                copyBtnText.innerText = 'Copied!';
                copyBtnText.classList.add('text-green-600');
                copyBtnIcon.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-600"></i>';
                lucide.createIcons();
                
                setTimeout(() => {
                    copyBtnText.innerText = 'Copy Data';
                    copyBtnText.classList.remove('text-green-600');
                    copyBtnIcon.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
                    lucide.createIcons();
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }

        function resetForm() {
            allInputs.forEach(input => input.value = '');
            generateDataFlow();
        }