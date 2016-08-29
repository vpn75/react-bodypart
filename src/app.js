import React, {Component} from 'react';
import {render} from 'react-dom';
import * as $ from 'jquery';
import {Form, 
		FormControl, 
		FormGroup, 
		Button,
		ControlLabel,
		Col} from 'react-bootstrap';
import {BodyPartDropDown, SearchResultTable, SearchResultRow} from './component';

export class App extends Component {
	constructor() {
		super();
		this.state = {
			//number: 1, 
			//text: "",
			style: "normal",
			results: [],
			optionState: "default"
		};
		
		this.doSearch = this.doSearch.bind(this);
		this.handleBPSelect = this.handleBPSelect.bind(this);
		this.handleTextFocus = this.handleTextFocus.bind(this);
		this.handleBPSelectFocus = this.handleBPSelectFocus.bind(this);
		
	}

	handleBPSelect(bp) {
		let search_url = this.props.api_root + '/bodypart/' + bp;

		this.serverRequest = $.getJSON(search_url, (data) => {
			this.setState({
				results: data.records,
				optionState: bp
			});
		});
	}

	//This method resets the text search field when focus is placed in the Bodypart dropdown
	handleBPSelectFocus() {
		const text_input = document.getElementById("text");
		text_input.value = "";
		this.setState({
			results: []
		});
	}

	handleTextFocus(e) {
		console.log(this.state.optionState);
		e.target.value = ""; //Clear previous search value on text focus
		this.setState({
			optionState: "default",
			results: []
		});
	}

	doSearch(e) {
		let code = e.target.value.toUpperCase();
		let re = /^img[1-9]/i;
		let params = {match: 'partial'};
		if (re.test(code)) {
			let search_url = this.props.api_root + '/code/' + code;
			this.serverRequest = $.getJSON(search_url, params, (data) => {
				this.setState({
					results: data.records
				});
				//console.log(data);
			});
		}
		else if (!code) {
			this.setState({
				results: []
			});
		}
		else {			
			let search_url = this.props.api_root + '/description/' + code;
			this.serverRequest = $.getJSON(search_url, (data) => {
				this.setState({
					results: (data.records.length > 0) ? data.records: []
				});
			});		
		}
	}

	render() {
		
		const bpselect_url = this.props.api_root + '/bodypart/';

		const rows = [];
			
		this.state.results.map((rec) => {
			let row = {
				imgcode: rec.imgcode,
				bodypart: rec.bodypart,
				modality: rec.modality,
				description: rec.description
			};
			rows.push(<SearchResultRow data={row} key={rec.imgcode}/>);
		});
		
		return(
			<div>
				<form className="form-inline">
					<div className="form-group">
						
							<label className="control-label">Search:</label>
							&nbsp;
							<input type="text" id="text" className="form-control" value={this.state.searchtext} placeholder="IMG or description" 
								onChange={this.doSearch}
								onFocus={this.handleTextFocus} 
								/>
							&nbsp;
							<BodyPartDropDown doSelect={this.handleBPSelect} 
								source={bpselect_url} 
								handleFocus={this.handleBPSelectFocus}
								optionState={this.state.optionState} />
					
					</div>
				</form>		
				<p/>
				<span>Your search returned: <b>{this.state.results.length}</b> results!</span>
				<SearchResultTable data={rows} />
			</div>
		);
	}
}

export class CreateForm extends Component {
	constructor() {
		super();
		this.state = {
			bodypart: [],
			imgcode_state: 'normal',
			bodypart_state: 'normal',
			modality_state: 'normal',
		};
		this.createModalitySelect = this.createModalitySelect.bind(this);
		this.createBodyPartSelect = this.createBodyPartSelect.bind(this);
		this.formValidate = this.formValidate.bind(this);
		this.validateIMGcode = this.validateIMGcode.bind(this);
		this.validateBodyPart = this.validateBodyPart.bind(this);
		this.validateModality = this.validateModality.bind(this);
		//this.isValid = this.isValid.bind(this);
	}

	createModalitySelect() {
		const modality = ['CR','CT','MR','US','PET','XA','NM','RF','MG'];
		const options = modality.sort().map(mod => {
				return (<option value={mod} key={mod}>{mod}</option>);
		});
		return(
			<FormGroup bsSize="small" controlId="formControlModalitySelect" validationState={this.state.modality_state}>
				<Col componentClass={ControlLabel} sm={2}>
						Modality:
				</Col>
				<Col sm={4}>
					<FormControl componentClass="select" placeholder="Select modality">
						<option value="" key="default"></option>
						{options}
					</FormControl>
				</Col>
			</FormGroup>
		);
	}

	createBodyPartSelect() {
		const bp_options = this.state.bodypart.map((bp) => {
			return(<option value={bp} key={bp}>{bp}</option>);
		});
		return (
			<FormGroup bsSize="small" controlId="formControlBodyPartSelect" validationState={this.state.bodypart_state}>
				<Col componentClass={ControlLabel} sm={2}>
							BodyPart:
				</Col>
				<Col sm={4}>
					<FormControl componentClass="select" placeholder="Select BodyPart">
						<option value="" key="default"></option>
						{bp_options}
					</FormControl>
				</Col>
			</FormGroup>
		);
	}

	componentDidMount() {
		const api_url = this.props.api_root + '/bodypart';
		this.serverRequest = $.getJSON(api_url, (data) => {
			//console.log(data);
			this.setState({
				bodypart: data.bodyparts
			});
		});
	}

	validateIMGcode() {
		const re = /^img\d{3,4}$/i;
		const imgcode = document.querySelector("#formIMGcode").value;
		if (re.test(imgcode)) {
			this.setState({
				imgcode_state: 'success'
			});
			return imgcode;
		}
		else {
			this.setState({
				imgcode_state: 'error'
			});
			return false;
		}
	}

	validateBodyPart() {
		
		const bodypart = document.querySelector("#formControlBodyPartSelect").value;

		if (bodypart == '') {
			this.setState({
				bodypart_state: 'error'
			});
			return false;
		}
		else {
			this.setState({
				bodypart_state: 'success'
			});
			return bodypart;
		}

	}

	validateModality() {
		const modality = document.querySelector("#formControlModalitySelect").value;

		if (modality == '') {
			this.setState({
				modality_state: 'error'
			});
			return false;
		}
		else {
			this.setState({
				modality_state: 'success'
			});
			return modality;
		}

	}
	
	formValidate() {
		const isvalid_imgcode = this.validateIMGcode();
		const isvalid_bodypart = this.validateBodyPart();
		const isvalid_modality = this.validateModality();

		if (isvalid_imgcode && isvalid_bodypart && isvalid_modality) {
				const new_bp = {
					imgcode: isvalid_imgcode.toUpperCase(),
					bodypart: isvalid_bodypart,
					modality: isvalid_modality,
					description: document.querySelector('#formProcedureDesc').value.toUpperCase()
				};

				$.ajax({
					method: 'POST',
					url: this.props.api_root,
					data: new_bp
				})
				.done((resp) => {
					alert('New procedure bodypart successfully submitted for ' + resp.imgcode + '/' + resp.bodypart);
				})
				.catch((err) => {
					alert('Submission failed! Please try again.');
				});
				
		}
		else {
			alert('One or more required fields are missing!');
		}
	}
	// }
	render() {
		const modalitySelect = this.createModalitySelect();
		const bodyPartSelect = this.createBodyPartSelect();

		return(
			<Form horizontal>
				<FormGroup bsSize="small" controlId="formIMGcode" validationState={this.state.imgcode_state}>
					<Col componentClass={ControlLabel} sm={2}>
						IMG code:
					</Col>
					<Col sm={4}>
						<FormControl type="text" placeholder="Enter EPIC IMG code"
						/>
						<FormControl.Feedback />
					</Col>
				</FormGroup>
				
				{bodyPartSelect}
				{modalitySelect}
				
				<FormGroup bsSize="small" controlId="formProcedureDesc">
					<Col componentClass={ControlLabel} sm={2}>
						Description:
					</Col>
					<Col sm={4}>
						<FormControl type="text" placeholder="Enter Procedure description" />
					</Col>
				</FormGroup>
				<FormGroup bsSize="small">
					<Col smOffset={2} sm={6}>
						<Button bsStyle="primary" onClick={this.formValidate}>Create</Button>
					</Col>
				</FormGroup>
			</Form>
		);
	}
}