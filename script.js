document.addEventListener('DOMContentLoaded', () => {
  // ======================
  // VARIÁVEIS GLOBAIS
  // ======================
  const CORRECT_PASSWORD = '0111';
  let currentPassword = '';
  let isRiddleActive = false;

  // SCREENS
  const loginScreen = document.getElementById('login-screen');
  const gameScreen = document.getElementById('game-screen');
  const rewardScreen = document.getElementById('reward-screen');

  // PASSWORD DISPLAY
  const passwordDisplay = document.getElementById('password-display');
  const keypadContainer = document.querySelector('.keypad');
  const enterBtn = document.getElementById('enter-button');
  const clearBtn = document.getElementById('clear-button');

  // JOGO
  const canvas = document.getElementById('maze-canvas');
  const ctx = canvas.getContext('2d');
  const keysCountDisplay = document.getElementById('keys-count');
  const chestsCountDisplay = document.getElementById('chests-count');
  const riddleBox = document.getElementById('riddle-container');
  const riddleText = document.getElementById('riddle-text');
  const riddleInput = document.getElementById('riddle-input');
  const submitRiddleBtn = document.getElementById('submit-riddle-btn');
  const openEnvelopeBtn = document.getElementById('open-envelope-button');
  const envelope = document.getElementById('envelope');
  const transitionScene = document.getElementById('transition-scene');
  const cardScene = document.querySelector('.card-scene');

  // ======================
  // IMAGENS
  // ======================
  const playerImg = new Image();
  playerImg.src = "imagens/kmila.png";

  const keyImg = new Image();
  keyImg.src = "imagens/chave.png";

  const chestImg = new Image();
  chestImg.src = "imagens/bau.png";

  const chestOpenImg = new Image();
  chestOpenImg.src = "imagens/bau aberto.png";

  playerImg.onload = () => {
    keyImg.onload = () => {
      chestImg.onload = () => {
        chestOpenImg.onload = () => {
          drawGame();
        }
      }
    }
  }

  // ======================
  // LABIRINTO (0 = livre, 1 = parede)
  // ======================
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,1,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,1,0,1,1],
    [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  const CELL_SIZE = canvas.width / maze[0].length;

  // PLAYER
  const player = {row: 1, col:1};

  // CHAVES E BAÚS
  let keysCollected = 0;
  let chestsOpened = 0;

  const keys = [
    {row:1,col:3},{row:3,col:4},{row:5,col:1},{row:7,col:7},{row:2,col:8}
  ];

  // 10 baús válidos
    const chests = [
        {row:1,col:5,riddle:"en qué año nació la mejor persona del mundo??", answer:"2002"},    // ok
        {row:1,col:10,riddle:"cuántos años tiene Kmila hoy?", answer:"23"},                     // ok
        {row:2,col:13,riddle:"cuál es la actriz favorita de Kmilita?", answer:"katie mcgrath"}, // ok
        {row:3,col:6,riddle:"qué animal de compañía tiene Kmila?", answer:"conejo"},        // alterei de 7 para 6
        {row:5,col:10,riddle:"cuál es la profesión de Kmila", answer:"profesora de inglés"}, // ok
        {row:6,col:1,riddle:"en qué país vive Kmila", answer:"Perú"}, // ok
        {row:7,col:12,riddle:"qué día de la semana nació Kmila?", answer:"viernes"},  // ok
        {row:9,col:3,riddle:"quien es la persona fav de midi", answer:"yo"}, // ok
        {row:10,col:6,riddle:"cuál es el hobby creativo favorito de Kmila?", answer:"crochet"}, // ok
        {row:11,col:9,riddle:"Cuál es la cantante favorita que Kmila tiene en común con Midi?", answer:"Taylor Swift"}  // ok
    ];

  // ======================
  // FUNÇÕES
  // ======================
  function drawGame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // LABIRINTO
    for(let r=0;r<maze.length;r++){
      for(let c=0;c<maze[r].length;c++){
        ctx.fillStyle = (maze[r][c]===1) ? 'black' : '#911c8bff';
        ctx.fillRect(c*CELL_SIZE,r*CELL_SIZE,CELL_SIZE,CELL_SIZE);
      }
    }

    // CHAVES
    keys.forEach(k=>{
      ctx.drawImage(keyImg, k.col*CELL_SIZE+2, k.row*CELL_SIZE+2, CELL_SIZE-4, CELL_SIZE-4);
    });

    // BAÚS
    chests.forEach(b=>{
      const img = (b.opened) ? chestOpenImg : chestImg;
      ctx.drawImage(img, b.col*CELL_SIZE+2, b.row*CELL_SIZE+2, CELL_SIZE-4, CELL_SIZE-4);
    });

    // PLAYER
    ctx.drawImage(playerImg, player.col*CELL_SIZE+2, player.row*CELL_SIZE+2, CELL_SIZE-4, CELL_SIZE-4);
  }

  function checkKeys(){
    keys.forEach((k,i)=>{
      if(k.row===player.row && k.col===player.col){
        keys.splice(i,1);
        keysCollected++;
        keysCountDisplay.textContent = keysCollected;
      }
    });
  }

  function checkChests(){
    chests.forEach(b=>{
      if(b.row===player.row && b.col===player.col && !b.opened){
        isRiddleActive = true;
        riddleBox.style.display='block';
        riddleText.textContent = b.riddle;
        submitRiddleBtn.onclick = ()=>{
          const ans = riddleInput.value.toLowerCase().trim();
          if(ans===b.answer.toLowerCase().trim()){
            alert("Correto! Baú aberto!");
            b.opened = true;
            chestsOpened++;
            chestsCountDisplay.textContent = chestsOpened;
            riddleBox.style.display='none';
            riddleInput.value='';
            isRiddleActive=false;
            drawGame();
            if(chestsOpened===chests.length){
              startRewardSequence();
            }
          } else {
            alert("Resposta incorreta, tente novamente!");
          }
        }
      }
    });
  }

function startRewardSequence(){
  gameScreen.classList.remove('active');
  rewardScreen.classList.add('active');

  // mostra a mensagem primeiro
  transitionScene.style.display = 'block';
  cardScene.style.display = 'none';

  // depois de 3 segundos, esconde a mensagem e mostra a carta
  setTimeout(() => {
    transitionScene.style.display = 'none';
    cardScene.style.display = 'flex';
  }, 3000); // 3 segundos
}



  // MOVIMENTO
  function movePlayer(dr,dc){
    if(isRiddleActive) return;
    const newRow = player.row+dr;
    const newCol = player.col+dc;
    if(maze[newRow] && maze[newRow][newCol]===0){
      player.row=newRow;
      player.col=newCol;
      drawGame();
      checkKeys();
      checkChests();
    }
  }

  document.addEventListener('keydown',(e)=>{
    switch(e.key){
      case 'ArrowUp': movePlayer(-1,0); break;
      case 'ArrowDown': movePlayer(1,0); break;
      case 'ArrowLeft': movePlayer(0,-1); break;
      case 'ArrowRight': movePlayer(0,1); break;
    }
  });

  document.querySelectorAll('.control-btn').forEach(btn=>{
    const move = btn.dataset.move;
    btn.addEventListener('click',()=>{
      switch(move){
        case 'up': movePlayer(-1,0); break;
        case 'down': movePlayer(1,0); break;
        case 'left': movePlayer(0,-1); break;
        case 'right': movePlayer(0,1); break;
      }
    });
  });

  // TECLADO NUMÉRICO LOGIN
  for(let i=1;i<=9;i++){
    const b=document.createElement('button');
    b.textContent=i;
    b.classList.add('keypad-button');
    b.addEventListener('click',()=>{ currentPassword+=i; updatePasswordDisplay(); });
    keypadContainer.appendChild(b);
  }

  const zeroBtn=document.createElement('button');
  zeroBtn.textContent='0';
  zeroBtn.classList.add('keypad-button');
  zeroBtn.addEventListener('click',()=>{ currentPassword+='0'; updatePasswordDisplay(); });
  keypadContainer.appendChild(zeroBtn);

  function updatePasswordDisplay(){
    passwordDisplay.textContent = '*'.repeat(currentPassword.length);
  }

  enterBtn.addEventListener('click',()=>{
    if(currentPassword===CORRECT_PASSWORD){
      alert("Chave correta! Vamos ao jogo!");
      loginScreen.classList.remove('active');
      gameScreen.classList.add('active');
      drawGame();
    } else {
      alert("Chave incorreta! Tente novamente!");
      currentPassword='';
      updatePasswordDisplay();
    }
  });

  clearBtn.addEventListener('click',()=>{
    currentPassword='';
    updatePasswordDisplay();
  });

});

function resizeCanvas(){
  canvas.width = Math.min(window.innerWidth*0.9, 600); // 90% da tela ou 600px
  canvas.height = canvas.width / maze[0].length * maze.length; // mantém proporção
  drawGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // chama ao iniciar
