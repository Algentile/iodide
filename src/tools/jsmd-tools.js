/* global IODIDE_JS_PATH IODIDE_CSS_PATH IODIDE_VERSION IODIDE_EVAL_FRAME_ORIGIN */
import _ from 'lodash'

import { newNotebook, newCell } from '../editor-state-prototypes'
import htmlTemplate from '../html-template'
import { addChangeLanguageTask } from '../actions/task-definitions'

const jsmdValidCellTypes = ['md', 'js', 'code', 'raw', 'css', 'plugin', 'fetch']


const jsmdToCellTypeMap = new Map([
  ['js', 'code'],
  ['code', 'code'],
  ['md', 'markdown'],
  ['plugin', 'plugin'],
  ['markdown', 'markdown'],
  ['raw', 'raw'],
  ['css', 'css'],
  ['fetch', 'fetch'],
])

const cellTypeToJsmdMap = new Map([
  ['plugin', 'plugin'],
  ['code', 'code'],
  ['markdown', 'md'],
  ['raw', 'raw'],
  ['css', 'css'],
  ['fetch', 'fetch'],
])

const jsmdValidNotebookSettings = [
  'title',
  'viewMode',
  'lastSaved',
  'savedEnvironment',
]
const jsmdValidCellSettingPaths = [
  'language',
  'skipInRunAll',
]

// format is eg: 'jsmd.path'.'old-value'.'NEW_VALUE'
const jsmdLegacyValueMappings = {
  viewMode: {
    presentation: 'REPORT_VIEW',
    editor: 'EXPLORE_VIEW',
  },
}

export function translateLegacyJsmd(state) {
  Object.keys(jsmdLegacyValueMappings).forEach((mappingPath) => {
    const valueAtPath = _.get(state, mappingPath)
    const mappingOfValuesToUpdate = _.get(jsmdLegacyValueMappings, mappingPath)
    if (valueAtPath in mappingOfValuesToUpdate) {
      _.set(
        state,
        mappingPath,
        mappingOfValuesToUpdate[valueAtPath],
      )
    }
  })
  return state
}

function parseMetaChunk(content, parseWarnings) {
  let metaSettings
  try {
    metaSettings = JSON.parse(content)
  } catch (e) {
    parseWarnings.push({
      parseError: 'Failed to parse notebook settings from meta cell. Using default settings.',
      details: content,
      jsError: `${e.name}: ${e.message}`,
    })
    metaSettings = {} // set content back to empty object
  }
  return { chunkType: 'meta', iodideSettings: metaSettings }
}

function parseCellChunk(chunkType, content, settings, str, chunkNum, parseWarnings) {
  let cellType = jsmdToCellTypeMap.get(chunkType)
  // if the cell type is not valid, set it to js
  if (jsmdValidCellTypes.indexOf(chunkType) === -1) {
    parseWarnings.push({
      parseError: 'invalid cell type, converted to js cell',
      details: `chunkType: ${chunkType} chunkNum:${chunkNum} raw string: ${str}`,
    })
    cellType = 'code'
  }

  const cell = newCell(chunkNum, cellType)
  cell.content = content
  // make sure that only valid cell settings are kept
  Object.keys(settings).forEach((path) => {
    if (_.includes(jsmdValidCellSettingPaths, path)) {
      _.set(cell, path, settings[path])
    } else {
      parseWarnings.push({
        parseError: 'invalid cell setting path',
        details: path,
      })
    }
  })

  return { chunkType: 'cell', cell }
}

function parseJsmdChunk(str, i, parseWarnings) {
  // note: this is not a pure function, it mutates parseWarnings
  let chunkType
  let settings = {}
  let content
  let firstLine
  const firstLineBreak = str.indexOf('\n')
  if (firstLineBreak === -1) {
    // a cell with only 1 line, and hence no content
    firstLine = str
    content = ''
  } else {
    firstLine = str.substring(0, firstLineBreak).trim()
    content = str.substring(firstLineBreak + 1).trim()
  }
  // let firstLine = str.substring(0,firstLineBreak).trim()
  const firstLineFirstSpace = firstLine.indexOf(' ')


  if (firstLineFirstSpace === -1) {
    // if there is NO space on the first line (after trimming), there are no cell settings
    chunkType = firstLine.toLowerCase()
  } else {
    // if there is a space on the first line (after trimming), there must be cell settings
    chunkType = firstLine.substring(0, firstLineFirstSpace).toLowerCase()
    // make sure the cell settings parse as JSON
    try {
      settings = JSON.parse(firstLine.substring(firstLineFirstSpace + 1))
    } catch (e) {
      parseWarnings.push({
        parseError: 'failed to parse cell settings, using defaults',
        details: firstLine,
        jsError: `${e.name}: ${e.message}`,
      })
    }
  }
  let chunkObject
  if (chunkType === 'meta') {
    chunkObject = parseMetaChunk(content, parseWarnings)
  } else {
    chunkObject = parseCellChunk(chunkType, content, settings, str, i, parseWarnings)
  }

  return chunkObject
}

function parseJsmd(jsmd) {
  const parseWarnings = []
  const chunkObjects = jsmd
    .split('\n%%')
    .map((str, chunkNum) => {
      // if this is the first chunk, and it starts with "%%", drop those chars
      let sstr
      if (chunkNum === 0 && str.substring(0, 2) === '%%') {
        sstr = str.substring(2)
      } else {
        sstr = str
      }
      return sstr
    })
    .map(str => str.trim())
    .filter(str => str !== '')
    .map((str, i) => parseJsmdChunk(str, i, parseWarnings))
  return { chunkObjects, parseWarnings }
}

function stateFromJsmd(jsmdString) {
  const parsed = parseJsmd(jsmdString)
  const { chunkObjects } = parsed
  const { parseWarnings } = parsed
  if (parseWarnings.length > 0) {
    console.warn('JSMD parse errors', parseWarnings)
  }
  // initialize a blank notebook
  const initialState = newNotebook()
  // add top-level meta settings if any exist
  const meta = chunkObjects.filter(c => c.chunkType === 'meta')[0]
  if (meta) {
    // For backward-compatibility: what used to be called "languages"
    // is now called "languageDefinitions"
    if (meta.iodideSettings.languages) {
      meta.iodideSettings.languageDefinitions = meta.iodideSettings.languages
      delete meta.iodideSettings.languages
    }

    // Only language definitions that are different than the built-in ones
    // are saved to the jsmd, so we want to merge any new ones here.
    if (meta.iodideSettings.languageDefinitions) {
      const { languageDefinitions } = meta.iodideSettings
      Object.keys(languageDefinitions)
        .filter(language => language !== 'js')
        .forEach((language) => {
          const languageDefinition = languageDefinitions[language]
          addChangeLanguageTask(
            languageDefinition.languageId,
            languageDefinition.displayName,
            languageDefinition.keybinding,
          )
          initialState.languageDefinitions[language] = languageDefinition
        })
      delete meta.iodideSettings.languageDefinitions
    }
    Object.assign(initialState, meta.iodideSettings)
  }
  return translateLegacyJsmd(initialState)
}

function exportJsmdBundle(state) {
  const htmlTemplateCompiler = _.template(htmlTemplate)
  return htmlTemplateCompiler({
    NOTEBOOK_TITLE: state.title,
    APP_PATH_STRING: IODIDE_JS_PATH,
    CSS_PATH_STRING: IODIDE_CSS_PATH,
    APP_VERSION_STRING: IODIDE_VERSION,
    EVAL_FRAME_ORIGIN: IODIDE_EVAL_FRAME_ORIGIN,
    JSMD: state.jsmd,
  })
}

function titleToHtmlFilename(title) {
  return `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`
}

export {
  parseJsmd,
  stateFromJsmd,
  jsmdValidCellTypes,
  jsmdToCellTypeMap,
  cellTypeToJsmdMap,
  jsmdValidNotebookSettings,
  jsmdValidCellSettingPaths,
  exportJsmdBundle,
  titleToHtmlFilename,
}
