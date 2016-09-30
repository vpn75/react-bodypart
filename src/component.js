import React, {Component} from 'react';
//import {Form, FormControl, FormGroup, Button, ControlLabel, Col} from 'react-bootstrap';
import {render} from 'react-dom';
import * as $ from 'jquery';

export class BodyPartDropDown extends Component {
	constructor() {
		super();
		this.state = {
				bodyparts: []
			};
		this.displayStandardSelect = this.displayStandardSelect.bind(this);
		this.displaySearchSelect = this.displaySearchSelect.bind(this);
		this.displayInlineSelect = this.displayInlineSelect.bind(this);
	}
	//Method to collect bodypart data from API and update component state
	componentDidMount() {
		fetch(this.props.source)
			.then(res => {
				res.json().then(data => {
					this.setState({bodyparts: data.bodyparts});
					//console.log("Using FETCH api!");
				});
			})
			.catch(err => {
				console.log(err);
			});
	}

	//This method returns Bodypart dropdown element with form validation.
	displayStandardSelect(options) {
		//Logic to display Bootstrap form validation
		let baseClass = 'form-group';
		let valState = this.props.validationState;
		if (valState === 'success') {
			baseClass += ' has-success';
		} else if (valState === 'error') {
			baseClass += ' has-error';
		}
		return(
			<div className={baseClass}>
				<label className='col-sm-2 control-label'>Bodypart:</label>
				&nbsp;
				<div className='col-sm-4'>
					<select id='formControlBodyPartSelect' className='form-control' placeholder='Select Bodypart'>
						<option value='' key='default'></option>
						{options}
					</select>
				</div>
			</div>
		);
	}

	//This method returns dropdown used in edit-mode under the Query-section of App.
	displayInlineSelect(options) {
		return(
			<select id='formControlBodyPartSelect' ref='bodypart' className='form-control' defaultValue={this.props.selected}>
				{options}
			</select>
		);
	}
	//This method returns dropdown used on the Query-section of the App.
	displaySearchSelect(options) {
		return(
			<div className="form-group">
				<label className="control-label">Bodypart:</label>
				<select className="form-control" 
					onChange={(e) => this.props.doSelect(e.target.value)} 
					name="bodypart" 
					value={this.props.optionState} 
					onFocus={this.props.handleFocus}>
				<option value=""></option>
					{options}
				</select>
			</div>
		);
	}

	render() {
		//Iterate through bodyparts state array and generate our Select options
		const options = this.state.bodyparts.map((bp) => {
			return(
				<option value={bp} key={bp}>{bp}</option>
			);
		});
		let selectDOM = '';
		if (this.props.inline) {
			selectDOM = this.displayInlineSelect(options);
		} else {
			selectDOM = (this.props.standard) ? this.displayStandardSelect(options) : this.displaySearchSelect(options);
		}
		
		return selectDOM;	
	}
}
//Displays Search results table based on data passed in by parent App component
export class SearchResultTable extends Component {
	constructor() {
		super();
	}
	render() {
		return(
			<table className="table table-striped table-hover">
					<thead>
					<tr>
						<th>IMG Code</th>
						<th>Bodypart</th>
						<th>Laterality</th>
						<th>Modality</th>
						<th>Description</th>
						<th></th>
						<th></th>
						
					</tr>
					</thead>
					<tbody id="bplist">
					{this.props.data}
					</tbody>
				</table>
		);
	}
}
// Component handles display of individual procedure bodyparts returned from API search. Supports Edit and Delete methods on row data.
export class SearchResultRow extends Component {
	constructor() {
		super();
		this.state = {
			editMode: false,
			edited: {}
		};

		this.displayDefaultRow = this.displayDefaultRow.bind(this);
		this.displayEditableRow = this.displayEditableRow.bind(this);
		this.createModalitySelect = this.createModalitySelect.bind(this);
		this.submitDBupdate = this.submitDBupdate.bind(this);
		this.displayDeleteConfirmPrompt = this.displayDeleteConfirmPrompt.bind(this);
		this.displayDefaultBtnGrp = this.displayDefaultBtnGrp.bind(this);
	}

	createModalitySelect(selected) {
		const modality = ['CR','CT','MR','US','PET','XA','NM','RF','MG'];
		const options = modality.sort().map(mod => {
				return (<option value={mod} key={mod}>{mod}</option>);
		});
		return(
			<select ref='modality' className='form-control' defaultValue={selected}>
				{options}
			</select>
			);
	}
	//This method handles update of procedure bodyparts
	submitDBupdate() {
		const update_url = this.props.source + '/update/' + this.props.data._id;
		console.log(update_url);
		let bp_update = {
			imgcode: this.refs.imgcode.value,
			bodypart: document.querySelector('#formControlBodyPartSelect').value,
			modality: this.refs.modality.value,
			description: this.refs.description.value.toUpperCase()
		};

		const payload = {
			method: 'PUT',
			body: JSON.stringify(bp_update),
			headers: {
				'Content-Type': 'application/json'
			}
		};

		fetch(update_url, payload)
			.then(resp => {
				console.log('Performing PUT using fetch API');
				if (resp.ok) {
					this.setState({
						editMode: false,
						saved: true
					});
					bp_update._id =  this.props.data._id;
					this.props.update(this.props.index, bp_update);
				}
			})
			.catch(err => {
				console.error(err);
				this.setState({editMode: false});
		});
	}

	displayEditableRow(data) {
		const bpselect_url = this.props.source + '/bodypart/';
		
		return(
				<tr key={data._id}>
					
					<td>
						<input type='text' className='form-control' ref='imgcode' defaultValue={data.imgcode} />
					</td>
					<td>
						<BodyPartDropDown source={bpselect_url} selected={data.bodypart} inline={true} />
					</td>
					<td>
						{this.createModalitySelect(data.modality)}
					</td>
					<td>
						<input type='text' className='form-control' ref='description' defaultValue={data.description} />
					</td>
					<td>
					<div className='btn-group btn-group-sm'>
						<button className='btn btn-default btn-sm' onClick={() => this.submitDBupdate()}>
							<span className='glyphicon glyphicon-floppy-disk'></span>
						</button>
						<button className='btn btn-default btn-sm' onClick={() => this.setState({editMode: false, saved: false})}>
							<span className='glyphicon glyphicon-floppy-remove' />
						</button>
					</div>
					</td>
					<td />
				</tr>
			);
	}

	displayDeleteConfirmPrompt() {
		return(
			<div className='btn-group btn-group-sm'>
			<button type='button' className='btn btn-danger btn-sm' onClick={() => this.props.remove(this.props.index)}>Confirm Deletion?</button>
			<button type='button' className='btn btn-default btn-sm' onClick={() => this.setState({delete_confirm: false})}>
				Cancel		
			</button>
			</div>
		);
	}

	displayDefaultBtnGrp() {
		let check_style = (this.state.saved) ? {color: 'green'} : {color: 'black'};
		return(
			<div className='btn-group btn-group-sm'>
			<button type="button" className="btn btn-default btn-sm" onClick={() => this.setState({editMode: !this.state.editMode})}>
						<span className={(this.state.saved) ? 'glyphicon glyphicon-floppy-saved' : 'glyphicon glyphicon-pencil'} 
						style={check_style} />
			</button>
			<button type='button' className='btn btn-default btn-sm' onClick={() => this.setState({delete_confirm: true})}>
					<span className='glyphicon glyphicon-trash' />
			</button>
			</div>
		)
	}

	displayLaterality(val) {
		 return <div className='circle'>{val.charAt(0)}</div>
	}

	displayDefaultRow(data) {
		
		let btn_group = (this.state.delete_confirm) ? this.displayDeleteConfirmPrompt() : this.displayDefaultBtnGrp();
		
		return(
				<tr key={data._id}>
				<td>{data.imgcode}</td>
				<td>{data.bodypart}</td>
				<td>{ (data.laterality) ? this.displayLaterality(data.laterality) : '' }</td>
				<td>{data.modality}</td>
				<td>{data.description}</td>
				<td>{btn_group}</td>
				<td />
			</tr>
			);
	}

	render() {
		//const data = this.props.data;
		const display = (this.state.editMode) ? this.displayEditableRow(this.props.data) : this.displayDefaultRow(this.props.data);

		return display;
	}
}


export class NavBar extends Component {
	constructor() {
		super();
		this.state = {
			mode: 'query'
		};
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(newmode) {
		//const newmode = (this.state.mode == 'query') ? 'insert' : 'query';
		this.setState({
			mode: newmode
		});

		this.props.changeMode(newmode);
		//console.log(this.state.mode);
	}

	render() {
		return(
		<div>
			<ul className="nav nav-tabs">
			  <li role="presentation" className={this.state.mode == 'query' ? 'active':''}>
			  	<a href="#query" onClick={() => this.handleClick('query')}>Query</a>
			  </li>
			  <li role="presentation" className={this.state.mode == 'insert' ? 'active':''}>
			  	<a href="#insert" onClick={() => this.handleClick('insert')}>Add New</a></li>
			</ul>
			<p></p>
		</div>
		);
	}

}

export class ModalitySelect extends Component {
	render() {
		const modality = ['CR','CT','MR','US','PET','XA','NM','RF','MG'];
		const options = modality.sort().map(mod => {
				return <option value={mod} key={mod}>{mod}</option>;
		});
		let baseClass = 'form-group';
		let valState = this.props.validationState || '';
		if (valState === 'success') {
			baseClass += ' has-success';
		} else if (valState === 'error') {
			baseClass += ' has-error';
		}	
		return (
			<div className={baseClass}>
				<label className='col-sm-2 control-label'>Modality: </label>
				<div className='col-sm-4'>
					<select id='formControlModalitySelect' className='form-control' placeholder='Select Modality'>
						<option value='' key='default'></option>
						{options}
					</select>
				</div>
			</div>
		);
	}
}