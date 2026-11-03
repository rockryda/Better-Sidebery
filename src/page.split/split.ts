const params = new URLSearchParams(window.location.search)

const leftUrl = params.get('left') || 'about:blank'
const rightUrl = params.get('right') || 'about:blank'
const leftTitle = params.get('title1') || leftUrl
const rightTitle = params.get('title2') || rightUrl

// Elements
const frameLeft = document.getElementById('frame_left') as HTMLIFrameElement
const frameRight = document.getElementById('frame_right') as HTMLIFrameElement
const titleLeft = document.getElementById('title_left') as HTMLElement
const titleRight = document.getElementById('title_right') as HTMLElement
const wrapperLeft = document.getElementById('wrapper_left') as HTMLElement
const resizer = document.getElementById('resizer') as HTMLElement
const dragShield = document.getElementById('drag_shield') as HTMLElement
const viewport = document.getElementById('viewport') as HTMLElement

const btnReloadLeft = document.getElementById('btn_reload_left') as HTMLButtonElement
const btnReloadRight = document.getElementById('btn_reload_right') as HTMLButtonElement
const btnOpenLeft = document.getElementById('btn_open_left') as HTMLButtonElement
const btnOpenRight = document.getElementById('btn_open_right') as HTMLButtonElement
const btnSwap = document.getElementById('btn_swap') as HTMLButtonElement
const btnDetach = document.getElementById('btn_detach') as HTMLButtonElement
const btn5050 = document.getElementById('btn_50_50') as HTMLButtonElement
const btn7030 = document.getElementById('btn_70_30') as HTMLButtonElement
const btn3070 = document.getElementById('btn_30_70') as HTMLButtonElement

// Initialize frames
if (frameLeft && leftUrl) frameLeft.src = leftUrl
if (frameRight && rightUrl) frameRight.src = rightUrl

if (titleLeft) titleLeft.textContent = leftTitle
if (titleRight) titleRight.textContent = rightTitle
document.title = `${leftTitle} | ${rightTitle}`

// Open pane in normal tab
btnOpenLeft?.addEventListener('click', () => {
  const url = frameLeft?.src || leftUrl
  if (typeof browser !== 'undefined' && browser.tabs) {
    browser.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
})

btnOpenRight?.addEventListener('click', () => {
  const url = frameRight?.src || rightUrl
  if (typeof browser !== 'undefined' && browser.tabs) {
    browser.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
})

// Reload handlers
btnReloadLeft?.addEventListener('click', () => {
  if (frameLeft) frameLeft.src = frameLeft.src
})

btnReloadRight?.addEventListener('click', () => {
  if (frameRight) frameRight.src = frameRight.src
})

// Swap panes
btnSwap?.addEventListener('click', () => {
  if (!frameLeft || !frameRight) return
  const curLeft = frameLeft.src
  const curRight = frameRight.src
  frameLeft.src = curRight
  frameRight.src = curLeft

  const tempTitle = titleLeft.textContent
  titleLeft.textContent = titleRight.textContent
  titleRight.textContent = tempTitle
  document.title = `${titleLeft.textContent} | ${titleRight.textContent}`
})

// Ratio presets
btn5050?.addEventListener('click', () => {
  if (wrapperLeft) wrapperLeft.style.width = '50%'
})

btn7030?.addEventListener('click', () => {
  if (wrapperLeft) wrapperLeft.style.width = '70%'
})

btn3070?.addEventListener('click', () => {
  if (wrapperLeft) wrapperLeft.style.width = '30%'
})

// Detach panes into separate browser tabs
btnDetach?.addEventListener('click', async () => {
  const curLeft = frameLeft?.src || leftUrl
  const curRight = frameRight?.src || rightUrl

  if (typeof browser !== 'undefined' && browser.tabs) {
    await browser.tabs.create({ url: curLeft })
    await browser.tabs.create({ url: curRight })
    const currentTab = await browser.tabs.getCurrent()
    if (currentTab?.id) {
      await browser.tabs.remove(currentTab.id)
    }
  } else {
    window.open(curLeft, '_blank')
    window.open(curRight, '_blank')
  }
})

// Draggable divider logic
let isDragging = false

resizer?.addEventListener('mousedown', (e: MouseEvent) => {
  isDragging = true
  resizer.classList.add('active')
  dragShield?.classList.add('active')
  document.body.style.cursor = 'col-resize'
  e.preventDefault()
})

window.addEventListener('mousemove', (e: MouseEvent) => {
  if (!isDragging || !viewport || !wrapperLeft) return

  const rect = viewport.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const minWidth = 100
  const maxWidth = rect.width - 100

  if (mouseX >= minWidth && mouseX <= maxWidth) {
    const percentage = (mouseX / rect.width) * 100
    wrapperLeft.style.width = `${percentage}%`
  }
})

window.addEventListener('mouseup', () => {
  if (!isDragging) return
  isDragging = false
  resizer?.classList.remove('active')
  dragShield?.classList.remove('active')
  document.body.style.cursor = 'default'
})

