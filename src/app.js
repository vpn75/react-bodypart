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
		let code = e.target.value;
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
		let textstyle = {fontWeight: this.state.style};
		let bpselect_url = this.props.api_root + '/bodypart/';

		let rows = [];
			
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
		this.createModalitySelect = this.createModalitySelect.bind(this);
	}

	createModalitySelect() {
		const modality = ['CR','CT','MR','US','PET','XA','NM','RF','MG'];
		const options = modality.sort().map(mod => {
				return (<option value={mod} key={mod}>{mod}</option>);
		});
		return(
			<FormGroup bsSize="small" controlId="formControlSelect">
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

	render() {
		const modalitySelect = this.createModalitySelect();
		return(
			<Form horizontal>
				<FormGroup bsSize="small" controlId="formIMGcode">
					<Col componentClass={ControlLabel} sm={2}>
						IMG code:
					</Col>
					<Col sm={4}>
						<FormControl type="text"  ref="imgcode" placeholder="Enter EPIC IMG code" />
					</Col>
				</FormGroup>
				<FormGroup bsSize="small" controlId="formBodyPart">
					<Col componentClass={ControlLabel} sm={2}>
						Bodypart:
					</Col>
					<Col sm={4}>
						<FormControl type="text" placeholder="Ex: ABDOMEN/CHEST/HEAD" />
					</Col>
				</FormGroup>
				{modalitySelect}
				<FormGroup bsSize="small" controlId="formProcedureDesc">
					<Col componentClass={ControlLabel} sm={2}>
						Procedure Description:
					</Col>
					<Col sm={4}>
						<FormControl type="text" placeholder="Enter Procedure description" />
					</Col>
				</FormGroup>
				<FormGroup bsSize="small">
					<Col smOffset={2} sm={6}>
						<Button bsStyle="primary" onClick={() => {console.log(document.querySelector("#formIMGcode").value)}}>Create</Button>
					</Col>
				</FormGroup>
			</Form>
		);
	}
}