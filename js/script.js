document.addEventListener("DOMContentLoaded", async () => {
    const scoreElement = document.getElementById("score");
    let score = 0;
  //
  //  Fonction pour obtenir un entier aléatoire entre min et max inclus
  //
  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //
  // Fonction pour mélanger un tableau
  //
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let pokemonData = [];

  //
  // Charge la liste des Pokémon depuis JSON
  //
  try {
    const response = await fetch("json/pokemonlist.json");
    if (!response.ok) throw new Error("Erreur réseau");
    pokemonData = await response.json();
  } catch (error) {
    console.error("Erreur chargement JSON:", error);
    return;
  }

  //
  // Sélection 8 Pokémon uniques au hasard
  //
  const selected = [];
  const usedIndexes = new Set();
  while (selected.length < 8) {
    const randIndex = getRandomIntInclusive(0, pokemonData.length - 1);
    if (!usedIndexes.has(randIndex)) {
      usedIndexes.add(randIndex);
      selected.push(pokemonData[randIndex]);
    }
  }

  //
  // Duplique et ajoute un uuid unique à chaque carte pour le DOM
  //
  const paired = selected.concat(selected).map((poke, index) => ({
    ...poke,
    uuid: `${poke.id}-${index}`,
  }));

  //
  // Mélange les cartes
  //
  const shuffledCards = shuffle(paired);

  //
  // Crée le plateau
  //
  const board = document.querySelector("#game-board");
  board.innerHTML = "";

  shuffledCards.forEach((poke) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = poke.id;
    card.dataset.uuid = poke.uuid;

    card.innerHTML = `
    <div class="card-inner">
    <div class="card-front">
        <img src="img/dessus.png" alt="Dos de carte" />
    </div>
    <div class="card-back">
        <img src="${poke.img}" alt="${poke.name}" />
    </div>
    </div>
`;
    board.appendChild(card);
  });

  //
  // Gestion du jeu : retour des cartes et comparaison
  //
  let firstCard = null;
  let lockBoard = false;

  board.addEventListener("click", (e) => {
    const clickedCard = e.target.closest(".card");
    if (!clickedCard) return;
    if (lockBoard) return;
    if (clickedCard.classList.contains("flipped")) return;

    clickedCard.classList.add("flipped");

    if (!firstCard) {
      firstCard = clickedCard;
    } else {
      lockBoard = true;

      const id1 = firstCard.dataset.id;
      const id2 = clickedCard.dataset.id;

      if (id1 === id2) {
        //
        // Paire trouvée
        //
        firstCard = null;
        lockBoard = false;
      } else {
        //
        // Pas une paire, retourne après 1s
        //
        setTimeout(() => {
          firstCard.classList.remove("flipped");
          clickedCard.classList.remove("flipped");
          firstCard = null;
          lockBoard = false;
        }, 1000); //
        score ++; // Ajout de 1 point au score 
        scoreElement.textContent = `${score}`; // Affichage du score
      }
    }
  });
});
