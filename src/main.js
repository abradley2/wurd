const html = require('yo-yo')

const SECRET_WORD = 'ILUVU'

const PLAYING_STATUS = Symbol('PLAYING_STATUS')
const WIN_STATUS = Symbol('WIN_STATUS')
const LOSE_STATUS = Symbol('LOSE_STATUS')

let status
let rows

function init () {
  status = PLAYING_STATUS
  rows = [
    [null, null, null, null, null],
    null,
    null,
    null,
    null,
    null
  ]
}

function checkWin () {
  return rows
    .filter(rowFilled)
    .map(function (r) {
      return r.join('')
    })
    .some(function (word) {
      return word === SECRET_WORD
    })
}

const ENTER = Symbol('ENTER')
const ENTER_KEY_CODE = 'Enter'

const BACK = Symbol('BACK')
const BACK_KEY_CODE = 'Backspace'

const keys = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  [ENTER, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', BACK]
]

const alpha = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').split('')

function rowFilled (r) {
  return r !== null && r.every(function (v) {
    return v !== null
  })
}

function onKey (e) {
  let rowIdx = 0
  let colIdx = 0
  while (true) {
    const currentRow = rows[rowIdx]
    const nextRow = rows[rowIdx + 1]
    const currentCol = currentRow && currentRow[colIdx]
    const nextCol = currentRow && currentRow[colIdx + 1]

    const firstEmptySpace = !nextRow && currentCol === null
    const lastFilledSpace = !nextRow && currentCol && !nextCol
    const lastFilledRow = rowFilled(currentRow) && !nextRow

    if (e.code === ENTER_KEY_CODE && lastFilledRow) {
      if (rowFilled(currentRow)) {
        if (nextRow !== null) {
          status = checkWin()
            ? WIN_STATUS
            : LOSE_STATUS
        } else {
          rows[rowIdx + 1] = [null, null, null, null, null]
        }
      }
      break
    }

    if (lastFilledSpace && e.code === BACK_KEY_CODE) {
      rows[rowIdx][colIdx] = null
      break
    }

    if (firstEmptySpace && alpha.includes(e.key.toUpperCase())) {
      rows[rowIdx][colIdx] = e.key.toUpperCase()
      if (checkWin()) status = WIN_STATUS
      break
    }

    if (typeof nextCol !== 'undefined') {
      colIdx = colIdx + 1
      continue
    }

    if (nextRow) {
      colIdx = 0
      rowIdx = rowIdx + 1
      continue
    }

    break
  }
}

document.addEventListener('keydown', function (e) {
  onKey(e)
  render()
})

function app () {
  return html`<div class="avenir vh-100 vw-100 pv3 bg-black-90 flex flex-column justify-between items-center white">
    ${header()}
    ${gameboard()}
    ${keyboard()}
  </div>`
}

function header () {
  return html`<div class="flex flex-column justify-start items-center">
    <button
      class="bg-transparent ba br1 b--white-30 ttu ph3 pv1 white f5 pointer hover-bg-white-20"
      onclick=${function () {
        init()
        render()
      }}
    >
      Reset Game
    </button>
    <div class="h2">
      ${(function () {
        switch (status) {
          case WIN_STATUS:
            return html`<h3>YOU'RE WINNER</h3>`
          case LOSE_STATUS:
            return html`<h3>YOU LOSE, BUT YOU LOOK NICE TODAY</h3>`
          default:
            return html`<span></span>`
        }
      })()}
    </div>
  </div>`
}

function gameboard () {
  const activeRowIdx = rows.reduce(function (acc, _, idx) {
    return acc === null
      ? (rows[idx + 1] === null ? idx : null)
      : acc
  }, null)
  return html`<div class="flex flex-column nt1">
    ${rows.map(function (row, rowIdx) {
      const rowClass = rowIdx === activeRowIdx
        ? 'bg-white-10'
        : ''
      return html`<div class="flex flex-nowrap nr1 mt1 ${rowClass}">
        ${(row || [null, null, null, null, null]).map(function (col, colIdx) {
          let colClass
          if (SECRET_WORD.includes(col)) {
            colClass = 'bg-yellow'
            if (SECRET_WORD[colIdx] === col) {
              colClass = 'bg-green'
            }
          }
          return html`<div class="inline-flex items-center justify-center w2 h2 w3-ns h3-ns ba br1 b--white-30 f5 fw7 mr1 ${colClass}">
            <span>${col || ' '}</span>
          </div>`
        })}
      </div>`
    })}
  </div>`
}

function keyboard () {
  return html`<div class="nt1 flex flex-column items-center">
    ${keys.map(function (row) {
      return html`<div class="nr1 mt1 flex flex-nowrap">
        ${row.map(function (k) {
          let label
          switch (k) {
            case ENTER:
              label = html`<span
                class="white inline-flex"
              >
                <span>ENT</span>
                <span
                  class="w1 h1"
                >
                  ${returnIcon()}
                </span>
              </span>`
              break
            case BACK:
              label = html`<span
                class="white inline-flex"
              >
                <span>DEL</span>
                <span
                  class="w1 h1"
                >
                  ${clearIcon()}
                </span>
              </span>`
              break
            default:
              label = k
          }

          return html`<button
            class="code mr1 pa2 pa3-ns bw0 br1 bg-white-30 f6 white pointer hover-bg-white-20"
            onclick=${function () {
              switch (k) {
                case ENTER:
                  onKey({ code: ENTER_KEY_CODE })
                  break
                case BACK:
                  onKey({ code: BACK_KEY_CODE })
                  break
                default:
                  onKey({ key: k })
              }
              render()
            }}
          >
            ${label}
          </button>`
        })}
      </div>`
    })}
  </div>`
}

function returnIcon () {
  return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
    <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
  </svg>`
}

function clearIcon () {
  return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h1 w1">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`
}

const appElement = document.createElement('div')
document.body.appendChild(appElement)

function render () {
  html.update(appElement, app())
}

init()
render()
