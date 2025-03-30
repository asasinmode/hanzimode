/**
 *  @typedef IHanzi
 *  @type {object}
 *  @property {string} symbol hanzi symbol
 *  @property {string} pinyin pinyin transcription of the hanzi
 *  @property {string} meaning hanzi meaning
 *  @property {string|undefined} note optional note
 */

/**
 *  @typedef IData
 *  @type {object}
 *  @property {number} version data version
 *  @property {IHanzi[]} hanzi saved hanzi
 */

let isShowingData = false;

/** @type {IData} */
let data = { version: '1', hanzi: [] };

const _version = localStorage.getItem('hanzimode.version');
if (!_version) {
	console.warn('no version detected, won\'t try reading stored data');
	localStorage.setItem('hanzimode.version', data.version);
} else if (_version !== data.version) {
	alert('mismatched versions');
} else {
	const _hanzi = localStorage.getItem('hanzimode.data');
	if (_hanzi) {
		try {
			data.hanzi = JSON.parse(_hanzi);
		} catch (error) {
			console.error('failed to parse stored data');
			console.error(error);
		}
	}
}

updateCollectionLength();
function updateCollectionLength() {
	document.getElementById('collectionStatus').textContent = data.hanzi.length;
}

function saveData() {
	localStorage.setItem('hanzimode.data', JSON.stringify(data.hanzi));
	localStorage.setItem('hanzimode.version', data.version);
}

/**
	* @param {SubmitEvent} event
	*/
function addItem(event) {
	event.preventDefault();
	/** @type {[HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLTextAreaElement]} */
	const [symbolInput, pinyinInput, meaningInput, noteInput] = event.target;

	const item = {
		symbol: symbolInput.value.trim(),
		pinyin: pinyinInput.value.trim(),
		meaning: meaningInput.value.trim(),
		note: noteInput.value.trim(),
	};

	const index = data.hanzi.findIndex(h => h.symbol === item.symbol);
	const addNew = index === -1;
	if (addNew) {
		data.hanzi.push(item);
		updateCollectionLength();
	} else {
		data.hanzi.splice(index, 1, item);
	}
	saveData();

	symbolInput.value = '';
	pinyinInput.value = '';
	meaningInput.value = '';
	noteInput.value = '';

	if (isShowingData) {
		const table = document.getElementById('dataTable');
		if (addNew) {
			addDataRow(table, item);
		} else {
			const row = document.getElementById(`data-${item.symbol}`);
			row.children.item(1).textContent = item.pinyin;
			row.children.item(2).textContent = item.meaning;
			row.children.item(3).textContent = item.note;
		}
	}
}

/**
	* @param {Event} event
	*/
function toggleData(event) {
	if (isShowingData) {
		document.getElementById('dataTable').remove();
		event.target.textContent = 'show data';
	} else {
		showData();
		event.target.textContent = 'hide data';
	}
	isShowingData = !isShowingData;
}

function showData() {
	const footer = document.querySelector('footer');
	const table = Object.assign(document.createElement('table'), { id: 'dataTable' });

	const headerRow = document.createElement('tr');
	const symbolHeader = Object.assign(document.createElement('th'), { textContent: 'hànzì', width: '7.5%' });
	const pinyinHeader = Object.assign(document.createElement('th'), { textContent: 'pinyin', width: '12.5%' });
	const meaningHeader = Object.assign(document.createElement('th'), { textContent: 'meaning', width: '35%' });
	const noteHeader = Object.assign(document.createElement('th'), { textContent: 'note', width: '35%' });
	const actionsHeader = Object.assign(document.createElement('th'), { textContent: 'actions', width: '10%' });

	headerRow.appendChild(symbolHeader);
	headerRow.appendChild(pinyinHeader);
	headerRow.appendChild(meaningHeader);
	headerRow.appendChild(noteHeader);
	headerRow.appendChild(actionsHeader);
	table.appendChild(headerRow);

	for (const item of data.hanzi) {
		addDataRow(table, item);
	}

	footer.appendChild(table);
}

/**
 * @param {HTMLTableElement} table
 * @param {IHanzi} hanzi
 */
function addDataRow(table, { symbol, pinyin, meaning, note }) {
	const row = Object.assign(document.createElement('tr'), { id: `data-${symbol}` });

	for (const property of [symbol, pinyin, meaning, note]) {
		const cell = Object.assign(document.createElement('td'), { textContent: property });
		row.appendChild(cell);
	}

	const actionsCell = document.createElement('td');
	const editButton = Object.assign(document.createElement('button'), { textContent: 'edit' });
	editButton.addEventListener('click', () => {
		document.getElementById('dataForm').scrollIntoView();
		const item = data.hanzi.find(h => h.symbol === symbol);
		document.getElementById('dataInputSymbol').value = item.symbol;
		document.getElementById('dataInputPinyin').value = item.pinyin;
		document.getElementById('dataInputMeaning').value = item.meaning;
		document.getElementById('dataInputNote').value = item.note;
	});
	actionsCell.appendChild(editButton);

	const deleteButton = Object.assign(document.createElement('button'), { textContent: 'delete' });
	deleteButton.addEventListener('click', () => {
		const proceed = confirm(`delete ${symbol}`);
		if (proceed) {
			const index = data.hanzi.findIndex(item => item.symbol === symbol);
			if (~index) {
				data.hanzi.splice(index, 1);
				saveData();
				row.remove();
				updateCollectionLength();
			}
		}
	});
	actionsCell.appendChild(deleteButton);
	row.appendChild(actionsCell);

	table.appendChild(row);
}

function exportData() {
	const content = JSON.stringify(data);
	const blob = new Blob([content], { type: 'application/json' });
	const href = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement('a'), {
		href,
		download: 'hanzimode.json',
	});
	a.click();
	URL.revokeObjectURL(href);
}

/** @param {InputEvent} event */
async function importData(event) {
	const [file] = event.target.files;
	if (file) {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				/** @type IData */
				const parsed = JSON.parse(reader.result);
				if (!parsed.version) {
					throw new Error('no version', reader.result);
				} else if (parsed.version !== data.version) {
					throw new Error('mismatched version');
				} else if (!parsed.hanzi || !Array.isArray(parsed.hanzi)) {
					throw new Error('invalid hanzi');
				}
				data = parsed;

				if (isShowingData) {
					document.getElementById('dataTable').remove();
					showData();
				}

				saveData();
				updateCollectionLength();
				event.target.value = '';
			} catch (e) {
				console.error(e);
				alert(e);
			}
		};
		reader.onerror = () => {
			console.error('reader error', reader.error);
			alert('failed to read file');
		};
		reader.readAsText(file);
	}
}
