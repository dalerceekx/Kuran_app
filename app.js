const surahInput = document.getElementById('surahInput');
const loadSurahBtn = document.getElementById('loadSurah');
const showAllSurahsBtn = document.getElementById('showAllSurahs');
const contentArea = document.getElementById('contentArea');

const API_BASE = 'https://api.alquran.cloud/v1';
const AUDIO_EDITION = 'ar.alafasy'; 
const TEXT_EDITION = 'quran-simple'; 

let currentAudio = null;


async function fetchSurah(surahNumber) {
    try {
        contentArea.innerHTML = '<div class="loading">Yuklanmoqda...</div>';
        const [textResponse, audioResponse] = await Promise.all([
            fetch(`${API_BASE}/surah/${surahNumber}/${TEXT_EDITION}`),
            fetch(`${API_BASE}/surah/${surahNumber}/${AUDIO_EDITION}`)
        ]);
        if (!textResponse.ok || !audioResponse.ok) {
            throw new Error('Ma\'lumotlarni yuklashda xatolik');
        }
        const textData = await textResponse.json();
        const audioData = await audioResponse.json();
        displaySurah(textData.data, audioData.data);
    } catch (error) {
        contentArea.innerHTML = `<div class="error">Xatolik: ${error.message}. Iltimos, qaytadan urinib ko'ring.</div>`;
    }
}

function displaySurah(textSurah, audioSurah) {
    const ayahs = textSurah.ayahs;
    const audioAyahs = audioSurah.ayahs;

    let html = `
        <div class="surah-info">
            <h2>${textSurah.name} - ${textSurah.englishName}</h2>
            <p>${textSurah.englishNameTranslation} | ${textSurah.numberOfAyahs} oyat | ${textSurah.revelationType === 'Meccan' ? 'Makkiy' : 'Madaniy'}</p>
        </div>
        <ul class="ayah-list">
    `;
    ayahs.forEach((ayah, index) => {
        const audioUrl = audioAyahs[index].audio;
        html += `
            <li class="ayah-item">
                <span class="ayah-number">${ayah.numberInSurah}</span>
                <div class="ayah-text">${ayah.text}</div>
                <div class="audio-controls">
                    <button onclick="playAyah('${audioUrl}', ${index})">🔊 Tinglash</button>
                </div>
                <audio id="audio-${index}" src="${audioUrl}" preload="none"></audio>
            </li>
        `;
    });
    html += '</ul>';
    contentArea.innerHTML = html;
}


function playAyah(audioUrl, index) {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = document.getElementById(`audio-${index}`);
    currentAudio.play();
}
async function showAllSurahs() {
    try {
        contentArea.innerHTML = '<div class="loading">Yuklanmoqda...</div>';
        
        const response = await fetch(`${API_BASE}/surah`);
        if (!response.ok) throw new Error('Ma\'lumotlarni yuklashda xatolik');
        
        const data = await response.json();
        const surahs = data.data;

        let html = '<div class="surah-list">';
        surahs.forEach(surah => {
            html += `
                <div class="surah-card" onclick="loadSurahFromCard(${surah.number})">
                    <h3>${surah.name}</h3>
                    <p>${surah.englishName}</p>
                    <p>${surah.englishNameTranslation}</p>
                    <p>${surah.numberOfAyahs} oyat</p>
                </div>
            `;
        });
        html += '</div>';
        
        contentArea.innerHTML = html;
    } catch (error) {
        contentArea.innerHTML = `<div class="error">Xatolik: ${error.message}</div>`;
    }
}

function loadSurahFromCard(surahNumber) {
    surahInput.value = surahNumber;
    fetchSurah(surahNumber);
}
loadSurahBtn.addEventListener('click', () => {
    const surahNumber = parseInt(surahInput.value);
    if (surahNumber >= 1 && surahNumber <= 114) {
        fetchSurah(surahNumber);
    } else {
        contentArea.innerHTML = '<div class="error">Iltimos, 1 dan 114 gacha bo\'lgan raqam kiriting</div>';
    }
});

showAllSurahsBtn.addEventListener('click', showAllSurahs);

surahInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadSurahBtn.click();
    }
});
fetchSurah(1);