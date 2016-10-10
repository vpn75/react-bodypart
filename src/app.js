import React, {Component} from 'react';
import {render} from 'react-dom';
import {BodyPartDropDown, SearchResultTable, SearchResultRow, ModalitySelect} from './component';

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
		this.spliceResults = this.spliceResults.bind(this);
		this.updateResults = this.updateResults.bind(this);	
	}

	handleBPSelect(bp) {
		let search_url = this.props.api_root + '/bodypart/' + bp;
		if (bp.length > 0) {
			fetch(search_url)
				.then(res => {
					res.json().then(data => {
						this.setState({
							results: data.records,
							optionState: bp
						});
					});
				})
				.catch(err => console.error(err));
		}
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
		//console.log(this.state.optionState);
		e.target.value = ''; //Clear previous search value on text focus
		this.setState({
			optionState: 'default',
			results: []
		});
	}

	doSearch(e) {
		let code = e.target.value.toUpperCase();
		let re = /^img[1-9]/i;
		if (re.test(code)) {
			let search_url = this.props.api_root + '/code/' + code + '?match=partial';
			fetch(search_url)
				.then(res => {
					res.json().then(data => {
						this.setState({
							results: data.records
						});
						//console.log('Using fetch API!');
					});
				})
				.catch(err => console.log(err));
		}
		else if (!code) {
			this.setState({
				results: []
			});
		}
		else {			
			let search_url = this.props.api_root + '/description/' + code;
			fetch(search_url)
				.then(res => {
					res.json().then(data => {
						this.setState({
							results: (data.records.length > 0) ? data.records : []
						});
					})
				})
				.catch(err => console.log(err));
		}
	}

	spliceResults(i) {
		this.state.results.splice(i,1);
		this.setState({
			results: this.state.results
		});
	}

	updateResults(i, data) {
		this.state.results[i] = data;
		this.setState({results: this.state.results});
	}

	render() {
		
		const bpselect_url = this.props.api_root + '/bodypart/';

		const rows = [];
			
		this.state.results.map((rec, idx) => {
			let row = {
				_id: rec._id,
				imgcode: rec.imgcode,
				bodypart: rec.bodypart,
				modality: rec.modality,
				description: rec.description
			};
			if (rec.laterality) {
				row.laterality = rec.laterality;
			}
			rows.push(<SearchResultRow index={idx} remove={this.spliceResults} update={this.updateResults} source={this.props.api_root} data={row} key={rec._id}/>);
		});
		
		return(
			<div style={{padding: '6px'}}>
				<form className='form-inline'>
					<div className='form-group'>
						
							<label className='control-label'>Search:</label>
							&nbsp;
							<input type='text' id='text' className='form-control' value={this.state.searchtext} placeholder='IMG or description' 
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
			imgcode_state: '',
			bodypart_state: '',
			modality_state: '',
			procdesc_state: '',
			submitStatus: ''
		};
		this.formValidate = this.formValidate.bind(this);
		this.validateIMGcode = this.validateIMGcode.bind(this);
		this.validateBodyPart = this.validateBodyPart.bind(this);
		this.validateModality = this.validateModality.bind(this);
		this.validateDescription = this.validateDescription.bind(this);
		this.formStatusMessage = this.formStatusMessage.bind(this);
		//this.isValid = this.isValid.bind(this);
	}
	
	validateIMGcode() {
		const re = /^img\d{3,4}$/i;
		const imgcode = document.querySelector("#formIMGcode").value;
		if (re.test(imgcode)) {
			this.setState({
				imgcode_state: 'success'
			});
			return imgcode.toUpperCase();
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
		//const modality = this.refs.modality.value;
		//console.log(modality);
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

	validateDescription() {
		const desc = document.querySelector('#formProcedureDesc').value;
		if (desc.length < 5) {
			this.setState({
				procdesc_state: 'error'
			});
		} else {
			this.setState({
				procdesc_state: 'success'
			});
		}
		return desc;
	}

	formStatusMessage() {
		const status = this.state.submitStatus;

		if (status.length > 1) {
			
			switch (status) {
				case 'success':
					return <div className='col-sm-6 alert alert-success' role='alert'>New bodypart procedure successfully added!</div>
					break;
				case 'warning':
					return <div className='col-sm-6 alert alert-warning' role='alert'>One or more required fields missing!</div>
					break;
				case 'error':
					return <div className='col-sm-6 alert alert-danger' role='alert'>Form submission error! Please try again.</div>
					break;
				default:
					return <div />
			}
		}		//console.log(this.state.submitStatus);
	}

	formValidate() {
		const isvalid_imgcode = this.validateIMGcode();
		const isvalid_bodypart = this.validateBodyPart();
		const isvalid_modality = this.validateModality();
		const isvalid_procdesc = this.validateDescription();
		if (isvalid_imgcode && isvalid_bodypart && isvalid_modality && isvalid_procdesc) {
				const new_bp = {
					imgcode: isvalid_imgcode,
					bodypart: isvalid_bodypart,
					modality: isvalid_modality,
					description: isvalid_procdesc.toUpperCase()
				};
				//Specify HTTP POST request parameters
				const payload = {
					method: 'POST',
					body: JSON.stringify(new_bp),
					headers: {
						'Content-Type': 'application/json'
					}
				};
				//Create new Request object to pass to Fetch API
				const myPost = new Request(this.props.api_root, payload);
				//Perform POST of new procedure bodypart using Fetch API
				fetch(myPost)
					.then(resp => {
						if (resp.status == 200) {
							this.setState({
								submitStatus: 'success'
							});	
							//console.log('Submitted via Fetch api');
						}
						else {
							console.log(resp);
							throw new Error('Error on API server with submission');
						}	
					})
					.catch(err => {
						console.log(err);
						this.setState({
							submitStatus: 'error',
							imgcode_state: 'error',
							bodypart_state: 'error',
							modality_state: 'error',
							procdesc_state: 'error',
						});
					});
				
		}
		else {
			this.setState({
				submitStatus: 'warning'
			});
		}
	}

	render() {
		const statusMsg = this.formStatusMessage();
		let imgcode_class = 'form-group';
		let imgcode_feedback = '';
		if (this.state.imgcode_state === 'success') {
			imgcode_class += ' has-success has-feedback'
			imgcode_feedback = 'glyphicon glyphicon-ok form-control-feedback';
		} else if(this.state.imgcode_state === 'error') {
			imgcode_class += ' has-error has-feedback';
			imgcode_feedback = 'glyphicon glyphicon-remove form-control-feedback';
			//console.log(imgcode_msg);
		}

		let procdesc_class = 'form-group';
		let procdesc_feedback = '';
		if (this.state.procdesc_state === 'success') {
			procdesc_class += ' has-success has-feedback'
			//console.log(procdesc_class);
			procdesc_feedback = 'glyphicon glyphicon-ok form-control-feedback';
		} else if(this.state.procdesc_state === 'error') {
			procdesc_class += ' has-error has-feedback'
			procdesc_feedback = 'glyphicon glyphicon-remove form-control-feedback';
		}
		let submit_status = this.state.submitStatus || '';
		let form_btn = '';
		if (submit_status === 'error' || submit_status === 'success') {
			form_btn = <button type='button' className='btn btn-primary btn-sm' 
				onClick={() => { 
					this.setState({imgcode_state: '', bodypart_state: '', modality_state: '', procdesc_state: '', submitStatus: ''});
					document.getElementById('createForm').reset(); 
					}
				}>
				Add New Procedure</button>;
		} else {
			form_btn = <button type='button' className='btn btn-primary btn-sm' onClick={this.formValidate}>Create</button>;
		}

		return(
			<div>
			<form id='createForm' className='form-horizontal'>
				<div className={imgcode_class}>
					<label className='col-sm-2 control-label'>IMG code:</label>
					<div className='col-sm-4'>
						<input type='text' id='formIMGcode' className='form-control' placeholder='Enter EPIC IMG code' />
						<span className={imgcode_feedback} />
					</div>
				</div>
				
				<BodyPartDropDown source={this.props.api_root + '/bodypart/'} standard='true' validationState={this.state.bodypart_state} />
				<ModalitySelect validationState={this.state.modality_state} />
				<div className={procdesc_class}>
					<label className='col-sm-2 control-label'>Enter Description:</label>
					<div className='col-sm-4'>
						<input type='text' id='formProcedureDesc' className='form-control' placeholder='Enter description' />
						<span className={procdesc_feedback} />
					</div>
				</div>
				<div className='form-group'>
					<div className='col-sm-offset-2 col-sm-6'>
						{form_btn}
					</div>
				</div>
			</form>
			<p />
			{statusMsg}
			</div>
		);
	}
}