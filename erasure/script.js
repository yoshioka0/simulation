const totalChunks = 5; // Total number of chunks (data + parity)
const dataChunksCount = 4; // Number of data chunks
let chunkSize = 0; // Will be calculated dynamically
let dataChunks = [];
let parityChunks = [];
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("storeBtn").addEventListener("click", storeData);
    document.getElementById("recoverBtn").addEventListener("click", recoverData);
    document.getElementById("fileInput").addEventListener("change", handleFileUpload);
});

function storeData() {
    const input = document.getElementById("dataInput").value.trim();
    if (!input) return;
    
    processInput(input);
    
    document.getElementById("dataInput").value = "";
}

function processInput(input) {
    chunkSize = Math.ceil(input.length / dataChunksCount); // Dynamic chunk size calculation
    dataChunks = splitIntoChunks(input, chunkSize);
    generateParity();
    updateView();
}

function splitIntoChunks(str, size) {
    let chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    
    // Ensure we always have `dataChunksCount` chunks
    while (chunks.length < dataChunksCount) {
        chunks.push("".padEnd(size, "\0")); // Padding with null characters
    }
    
    return chunks;
} 

function generateParity() {
    parityChunks = Array(totalChunks - dataChunksCount).fill("");

    for (let i = 0; i < totalChunks - dataChunksCount; i++) {
        let parityData = new Array(chunkSize).fill(0); // Initialize parity data as an array of zeros

        for (let chunkIndex = 0; chunkIndex < dataChunks.length; chunkIndex++) {
            let chunk = dataChunks[chunkIndex];

            for (let j = 0; j < chunkSize; j++) {
                let charCode = chunk.charCodeAt(j) || 0;
                
                // Simple XOR parity
                parityData[j] ^= charCode;
            }
        }

        parityChunks[i] = String.fromCharCode(...parityData);
    }
}

let totaldataSize = 0;
let totalparitySize = 0;

function updateView() {
    const container = document.getElementById("chunkContainer");
    container.innerHTML = ""; // Clear previous content

    totaldataSize = 0;
    totalparitySize = 0;

    // Display data chunks
    dataChunks.forEach((chunk, index) => {
        let size = chunk ? new Blob([chunk]).size : 0;
        totaldataSize += size; // Update total data size

        const chunkDiv = document.createElement("div");
        chunkDiv.className = "chunk";
        chunkDiv.innerHTML = `<p><span class="highlight">Data Chunk ${index + 1}:</span> ${chunk || "[DELETED]"} (Size: ${size} bytes)</p> 
                              <button onclick="deleteChunk(${index})">Delete</button>`;
        container.appendChild(chunkDiv);
    });

    // Display parity chunks
    parityChunks.forEach((chunk, index) => {
        let size = new Blob([chunk]).size;
        totalparitySize += size; // Update total parity size

const chunkDiv = document.createElement("div");
chunkDiv.className = "chunk";
chunkDiv.innerHTML = `<p><span class="highlight2">Parity Chunk ${index + 1}:</span> ${chunk} (Size: ${size} bytes)</p>`;
container.appendChild(chunkDiv);
    });

    // Update the total size displays
document.getElementById("cs").innerHTML = `<span class="highlight">Total Data Size:</span> ${totaldataSize} bytes || `;
document.getElementById("ps").innerHTML = `<span class="highlight">Total Parity Size:</span> ${totalparitySize} bytes`;
}

function deleteChunk(index) {
    if (index >= 0 && index < dataChunks.length) {
        dataChunks[index] = null;
    }
    updateView();
}

function recoverData() {
    let missingIndexes = [];

    for (let i = 0; i < dataChunks.length; i++) {
        if (dataChunks[i] === null) {
            missingIndexes.push(i);
        }
    }

    if (missingIndexes.length === 0) {alert('// Nothing to recover'); return;}

    missingIndexes.forEach(index => {
        let recovered = new Array(chunkSize).fill(0);

        for (let j = 0; j < chunkSize; j++) {
            let parityValue = 0;

            for (let k = 0; k < dataChunks.length; k++) {
                if (k !== index && dataChunks[k] !== null) {
                    parityValue ^= dataChunks[k].charCodeAt(j) || 0;
                }
            }

            for (let p = 0; p < parityChunks.length; p++) {
                parityValue ^= parityChunks[p].charCodeAt(j) || 0;
            }

            recovered[j] = String.fromCharCode(parityValue);
        }

        dataChunks[index] = recovered.join("");
    });

    updateView();
}

// footer
const footer = document.querySelector('.footer-content');
	if (footer) {
	    const observer = new IntersectionObserver(entries => {
	        entries.forEach(entry => {
	            footer.classList.toggle('p-visible', entry.isIntersecting);
	        });
	    });
	    observer.observe(footer);
	}
// theme
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Check saved theme preference
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        themeToggle.textContent = "☀️ Light Mode";
    }

    // Toggle Theme
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        if (body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙 Dark Mode";
        } else {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️ Light Mode";
        }
    });
});