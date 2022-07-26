// Creating an object to represent the Pomodoro App
const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0
};

let interval;


// Default mode on page load
const permission = () => {

  // Check if browser supports notification,
  // else this code block would not be executed
  if ('Notification' in window) {
    // Check if notification is neither granted nor denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // then ask for permission
      Notification.requestPermission().then((permission) => {
        // if permission is granted
        if (permission === 'granted') {
          // Create a new notification
          new Notification('Awesome! You will be notified at the start of each session');
        }
      });
    }

  }
  // Conditional statements for reinforcing each mode
  // as a way to reference mode consistently
  const mode = timer.mode;
  if (mode === 'longBreak') {
    switchMode('longBreak');
  }
  else if (mode === 'shortBreak') {
    switchMode('shortBreak');
  }

  else switchMode('pomodoro');
};

const getRemainingTime = (endTime) => {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds
  };
}

const startTimer = () => {
  /* Set the total from where the countdown begins.
  So that total is the total property under timer object -- `timer.remainingTimer.total`
*/
  let { total } = timer.remainingTime;
  // Retreive timestamp of current moment + total milliseconds of session to get the exact time in future when timer will end
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === 'pomodoro') {
    timer.sessions++;
  }

  // Change button to stop once clicked
  startButton.dataset.action = 'stop';
  startButton.textContent = 'stop';
  startButton.classList.add('active');

  interval = setInterval(() => {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      // Automatically switch mode after end of each session
      switch (timer.mode) {
        case 'pomodoro':
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode('longBreak');
            startTimer();
          } else {
            switchMode('shortBreak');
            startTimer();
          }
          break;
        default:
          switchMode('pomodoro');
          startTimer();
      }

      // Change background color of progress value in 'shortBreak' mode
      // Initially used. Keeping incase of future use
      // const progressBar = document.querySelector('#progress-js');
      // if (timer.mode === 'shortBreak') {
      //   progressBar.classList.add('progress-short');
      // } else {
      //   progressBar.classList.remove('progress-short');
      // }
      // Sound according to mode
      document.querySelector(`[data-sound='${timer.mode}']`).play();

      // Display notification on new session
      if (Notification.permission === 'granted') {
        const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
        new Notification(text);
      }

      // startTimer();

    }
  }, 1000);
}

const stopTimer = () => {
  clearInterval(interval);
  startButton.dataset.action = 'start';
  startButton.textContent = 'start';
  startButton.classList.remove('active');
}


const rotateProgress = () => {

  var quad1 = document.querySelector('.quad1'),
    quad2 = document.querySelector('.quad2'),
    quad3 = document.querySelector('.quad3'),
    quad4 = document.querySelector('.quad4');
  progress = timer[timer.mode] * 60 - timer.remainingTime.total;


  if (progress <= 15) {
    quad1.setAttribute('style', 'transform: skew(' + progress * (-90 / 15) + 'deg)');
  }
  else if (progress > 15 && progress <= 30) {
    quad1.setAttribute('style', 'transform: skew(-90deg)');
    quad2.setAttribute('style', 'transform: skewY(' + (progress - 15) * (90 / 15) + 'deg)');
  }
  else if (progress > 30 && progress <= 45) {
    quad1.setAttribute('style', 'transform: skew(-90deg)');
    quad2.setAttribute('style', 'transform: skewY(90deg)');
    quad3.setAttribute('style', 'transform: skew(' + (progress - 30) * (-90 / 15) + 'deg)');
  }
  else if (progress > 45 && progress <= 60) {
    quad1.setAttribute('style', 'transform: skew(-90deg)');
    quad2.setAttribute('style', 'transform: skewY(90deg)');
    quad3.setAttribute('style', 'transform: skew(-90deg)');
    quad4.setAttribute('style', 'transform: skewY(' + (progress - 45) * (90 / 15) + 'deg)');
  }

}

const updateClock = () => {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  const min = document.querySelector('#minutes-js');
  const sec = document.querySelector('#seconds-js');
  min.textContent = minutes;
  sec.textContent = seconds;

  rotateProgress();


  // Reflect Countdown in document title. 
  // This will help user to know remaining time
  // without the need to switch tabs
  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break';
  document.title = `${minutes}:${seconds} - ${text}`;
}

const switchMode = (mode) => {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60, // using bracket notation
    minutes: timer[mode], // bracket notation
    seconds: 0
  };

  document
    .querySelectorAll('button[data-mode]')
    .forEach(element => element.classList.remove('active'));
  document.querySelector(`[data-mode='${mode}']`).classList.add('active');

  document.body.style.backgroundColor = `var(--${mode})`;

  document
    .querySelectorAll('.same')
    .forEach(element => element.removeAttribute('style'));

  updateClock();

}

const handleMode = (e) => {
  const { mode } = e.target.dataset;

  if (!mode) return;

  timer.sessions = 0;
  switchMode(mode);
  stopTimer();
}

const start = () => {
  const action = startButton.dataset.action;
  if (action === 'start') {
    buttonSound.play();
    permission();
    startTimer();
  } else {
    stopTimer();
  }
}

const buttonSound = new Audio('media/button-sound.mp3');
const startButton = document.querySelector('#btn-js');
startButton.addEventListener('click', start);
const modeButtons = document.querySelector('#mode-buttons-js');
modeButtons.addEventListener('click', handleMode);
// Commenting out for now, might later need it
// window.onscroll = function () {
//   let scroll = window.pageYOffset;
//   const modebtn = document.querySelectorAll('.mode-button');
//   if (scroll > 20 && scroll <= 200) {
    
//     modebtn.forEach(element => {
//       element.style.color = '#333';
//     })
//   } else {
//     modebtn.forEach(element => {
//       element.style.color = '#fff';
//     })
//   }
// }