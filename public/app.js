var socket = io()
const chnAr = ['0', '26.965.00', '26.975.00', '26.985.00', '27.005.00', '27.015.00', '27.025.00', '27.035.00', '27.055.00', '27.065.00', '27.075.00', '27.085.00',
  '27.105.00', '27.115.00', '27.125.00', '27.135.00', '27.155.00', '27.165.00', '27.175.00', '27.185.00', '27.205.00', '27.215.00', '27.225.00', '27.255.00', '27.235.00',
  '27.245.00', '27.265.00', '27.275.00', '27.285.00', '27.295.00', '27.305.00', '27.315.00', '27.325.00', '27.335.00', '27.345.00', '27.355.00', '27.365.00', '27.375.00',
  '27.385.00', '27.395.00', '27.405.00']

$('#FM').click(function () {
  socket.emit('change mod', 'FM')
})
$('#AM').click(function () {
  socket.emit('change mod', 'AM')
})
$('#USB').click(function () {
  socket.emit('change mod', 'USB')
})
$('#LSB').click(function () {
  socket.emit('change mod', 'LSB')
})
$('#command').submit(function () {
  console.log(document.getElementById('cmdID').value)
  e.preventDefault()
  socket.emit('command', document.getElementById('cmdID').value)
  $('#cmdID').innerText = ''
})

$('#minus').click(function () {
  if (document.getElementById('frq').value != '1') {
    socket.emit('minus', document.getElementById('frq').value)
  }
})
$('#plus').click(function () {
  if (document.getElementById('frq').value != '40') {
    socket.emit('plus', document.getElementById('frq').value)
  }
})

$('#chnOverlayBtn').click(function () {
  document.getElementById('overlayWindow').style.visibility = 'visible'
})

$('#oEnter').click(function () {
  if (document.getElementById('chnOTextarea').value != undefined) {
    var chnValue = parseInt(document.getElementById('chnOTextarea').value)
    if (chnValue <= 0 || chnValue >= 41) {
      document.getElementById('chnOTextarea').value = 'Invalid Channel'
      return
    }
    if (chnValue > 0 || chnValue < 41) {
      socket.emit('chnEnter', document.getElementById('chnOTextarea').value)
    }
  }
  document.getElementById('overlayWindow').style.visibility = 'hidden'
  document.getElementById('chnOTextarea').value = ''
})

$('#bBack').click(function () {
  document.getElementById('chnOTextarea').value = ''
  document.getElementById('overlayWindow').style.visibility = 'hidden'
})
var chnSelectDisplay = document.getElementById('chnOTextarea')

$('#b1').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '1'
  }
})
$('#b2').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '2'
  }
})
$('#b3').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '3'
  }
})
$('#b4').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '4'
  }
})
$('#b5').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '5'
  }
})
$('#b6').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '6'
  }
})
$('#b7').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '7'
  }
})
$('#b8').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '8'
  }
})
$('#b9').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '9'
  }
})
$('#b0').click(function () {
  if (chnSelectDisplay.value.length < 2) {
    document.getElementById('chnOTextarea').value += '0'
  }
})
// Delete
$('#oDelete').click(function () {
  document.getElementById('chnOTextarea').value = ''
})

// Shutdown Pc
$('#shutdown').click(function () {
  socket.emit('shutdown')
})

socket.on('frq', data => {
  if (data != null) {
    document.getElementById('frq').value = data
    for (i = 0; i <= chnAr.length; i++) {
      if (chnAr[i] == data) {
        document.getElementById('chn').value = chnAr.indexOf(data)
        document.getElementById('mainwindow').style.backgroundColor = 'black'
        document.getElementById('warning').style.visibility = 'hidden'
        return
      } else {
        document.getElementById('chn').value = '!'
        document.getElementById('warning').style.visibility = 'visible'
        document.getElementById('mainwindow').style.backgroundColor = 'red'
      }
    }
  }
})

var noiselevelInt = 0

socket.on('noise', data => {
  noiselevelInt = parseInt(data)
  // document.getElementById("noiserange").value = noiselevelInt
})

nrSmootherInt = setInterval(function () {
  if (noiselevelInt > document.getElementById('noiserange').value) {
    document.getElementById('noiserange').value = noiselevelInt
  }
  if (noiselevelInt < document.getElementById('noiserange').value) {
    document.getElementById('noiserange').value -= 1
  }
  if (noiselevelInt - document.getElementById('noiserange').value > 60 || noiselevelInt - document.getElementById('noiserange').value < -60) {
    document.getElementById('noiserange').value = noiselevelInt
  }
}, 100)

socket.on('cMod', data => {
  switch (data) {
    case 'USB':
      document.getElementById('USB').style.backgroundColor = 'red'

      document.getElementById('LSB').style.backgroundColor = 'white'
      document.getElementById('AM').style.backgroundColor = 'white'
      document.getElementById('FM').style.backgroundColor = 'white'
      break
    case 'LSB':
      document.getElementById('LSB').style.backgroundColor = 'red'

      document.getElementById('USB').style.backgroundColor = 'white'
      document.getElementById('AM').style.backgroundColor = 'white'
      document.getElementById('FM').style.backgroundColor = 'white'
      break
    case 'AM':
      document.getElementById('AM').style.backgroundColor = 'red'

      document.getElementById('USB').style.backgroundColor = 'white'
      document.getElementById('LSB').style.backgroundColor = 'white'
      document.getElementById('FM').style.backgroundColor = 'white'
      break
    case 'FM':
      document.getElementById('FM').style.backgroundColor = 'red'

      document.getElementById('USB').style.backgroundColor = 'white'
      document.getElementById('AM').style.backgroundColor = 'white'
      document.getElementById('LSB').style.backgroundColor = 'white'
      break
  }
})

document.getElementById('FM').style.backgroundColor = 'red'
