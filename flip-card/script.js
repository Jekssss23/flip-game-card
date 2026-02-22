document.addEventListener("DOMContentLoaded", () => {
  // 1. Data kartu dengan gambar, teks, warna, dan audio
  const cardData = [
    {
      image: "/public/apel.png",
      text: "Apel",
      color: "#ff6b6b",
      soundId: "apel-sound",
    },
    {
      image: "/public/pisang.png",
      text: "Pisang",
      color: "#ffe066",
      soundId: "pisang-sound",
    },
    {
      image: "/public/jeruk.png",
      text: "Jeruk",
      color: "#ffa94d",
      soundId: "jeruk-sound",
    },
    {
      image: "/public/anggur.png",
      text: "Anggur",
      color: "#cc5de8",
      soundId: "anggur-sound",
    },
    {
      image: "/public/semangka.png",
      text: "Semangka",
      color: "#c0eb75",
      soundId: "semangka-sound",
    },
    {
      image: "/public/stroberi.png",
      text: "Stroberi",
      color: "#ff8787",
      soundId: "stroberi-sound",
    },
  ];

  // 2. Variabel state game
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let score = 0;
  let lockBoard = false;

  // 3. Elemen DOM
  const gameBoard = document.getElementById("game-board");
  const scoreElement = document.getElementById("score");
  const movesElement = document.getElementById("moves");
  const resetButton = document.getElementById("reset-btn");
  const winMessage = document.getElementById("win-message");
  const finalScoreElement = document.getElementById("final-score");
  const finalMovesElement = document.getElementById("final-moves");
  const playAgainButton = document.getElementById("play-again");

  // Elemen audio
  const matchSound = document.getElementById("match-sound");
  const winSound = document.getElementById("win-sound");

  // 4. Fungsi untuk mengocok array (Fisher-Yates Shuffle)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 5. Fungsi untuk memutar suara buah dengan penanganan error
  function playFruitSound(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
      audio.currentTime = 0; // Reset audio ke awal
      const playPromise = audio.play();

      // Menangani error jika audio gagal diputar (misal: browser memblokir autoplay)
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Gagal memutar suara:", error);
        });
      }
    }
  }

  // 6. Inisialisasi game
  function initGame() {
    // Duplikat data dan tambahkan ID unik
    const gameCards = [...cardData, ...cardData].map((card, index) => ({
      ...card,
      id: index,
      pairId: card.text, // ID untuk mencocokkan pasangan
    }));

    // Acak kartu
    cards = shuffleArray(gameCards);

    // Reset state
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    lockBoard = false;

    // Update UI
    scoreElement.textContent = score;
    movesElement.textContent = moves;
    winMessage.style.display = "none";
    gameBoard.innerHTML = ""; // Bersihkan papan

    // Buat elemen kartu
    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.dataset.id = card.id; // Simpan ID di dataset
      cardElement.dataset.pairId = card.pairId; // Simpan pair ID

      // Terapkan warna ke elemen kartu
      cardElement.style.setProperty('--card-color', card.color);

      cardElement.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="${card.image}" alt="${card.text}">
            <div class="card-text">${card.text}</div>
          </div>
          <div class="card-back">?</div>
        </div>
      `;

      cardElement.addEventListener("click", flipCard);
      gameBoard.appendChild(cardElement);
    });
  }

  // 7. Fungsi untuk membalik kartu
  function flipCard() {
    // Cegah klik jika papan terkunci atau kartu sudah terbuka
    if (lockBoard) return;
    if (this === flippedCards[0]) return;
    if (this.classList.contains("flipped")) return;

    this.classList.add("flipped");
    flippedCards.push(this);

    // Mainkan suara buah
    const cardId = this.dataset.id;
    const cardInfo = cards.find((c) => c.id == cardId);
    if (cardInfo) {
      setTimeout(() => playFruitSound(cardInfo.soundId), 300);
    }

    // Jika sudah 2 kartu terbuka
    if (flippedCards.length === 2) {
      lockBoard = true;
      moves++;
      movesElement.textContent = moves;
      setTimeout(checkMatch, 800); // Jeda agar user sempat lihat kartu
    }
  }

  // 8. Periksa kecocokan kartu
  function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.pairId === card2.dataset.pairId;

    if (isMatch) {
      disableCards();
      matchSound.play();
      score += 10;
      scoreElement.textContent = score;
      matchedPairs++;

      // Cek kemenangan
      if (matchedPairs === cardData.length) {
        setTimeout(() => {
          winSound.play();
          showWinMessage();
        }, 500);
      }
    } else {
      unflipCards();
    }
  }

  // 9. Nonaktifkan kartu yang cocok
  function disableCards() {
    flippedCards.forEach((card) => {
      card.style.pointerEvents = "none"; // Cegah klik lagi
      // Opsional: Tambahkan efek visual kartu cocok
      card.querySelector('.card-front').style.opacity = "0.7"; 
    });
    resetBoard();
  }

  // 10. Balikkan kembali kartu yang tidak cocok
  function unflipCards() {
    flippedCards.forEach((card) => {
      card.classList.remove("flipped");
    });
    resetBoard();
  }

  // 11. Reset papan
  function resetBoard() {
    [lockBoard, flippedCards] = [false, []];
  }

  // 12. Tampilkan pesan kemenangan
  function showWinMessage() {
    finalScoreElement.textContent = score;
    finalMovesElement.textContent = moves;
    winMessage.style.display = "flex";
  }

  // Event Listeners
  resetButton.addEventListener("click", initGame);
  playAgainButton.addEventListener("click", initGame);

  // Mulai game
  initGame();
});