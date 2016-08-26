import React, {Component} from 'react';
import {FormControl, FormGroup, Button} from 'react-bootstrap';
import {render} from 'react-dom';

import * as $ from 'jquery';

export class BodyPartDropDown extends Component {
	constructor() {
		super();
		this.handleSelect = this.handleSelect.bind(this);
		this.state = {
				bodyparts: []
			};

	}
	//Method to collect bodypart data from API and update component state
	componentDidMount() {
		this.serverRequest = $.getJSON(this.props.source, (data) => {
			this.setState({bodyparts: data.bodyparts});
		});
	}

	//Calls method in parent App component to perform bodypart search
	handleSelect(e) {
		//console.log(e.target.value);
		this.props.doSelect(e.target.value);
	}

	//Cleanup method 
	componentWillUnmount() {
		this.serverRequest.abort();
	}

	render() {
		//Iterate through bodyparts state array and generate our Select options
		const options = this.state.bodyparts.map((bp) => {
			return(
				<option value={bp} key={bp}>{bp}</option>
			);
		});
		return (
		<div className="form-group">
			<label className="control-label">Bodypart:</label>&nbsp;
			<select className="form-control" onChange={this.handleSelect} 
				name="bodypart" 
				value={this.props.optionState}
				 onFocus={this.props.handleFocus}>
			<option value="default"></option>
			{options}
			</select>
		</div>
		);
		
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
						<th>Modality</th>
						<th>Description</th>
						
					</tr>
					</thead>
					<tbody id="bplist">
					{this.props.data}
					</tbody>
				</table>
		);
	}
}

export class SearchResultRow extends Component {
	constructor() {
		super();
	}
	render() {
		let data = this.props.data;
		return(
			<tr key={data.imgcode}>
				<td>{data.imgcode}</td>
				<td>{data.bodypart}</td>
				<td>{data.modality}</td>
				<td>{data.description}</td>
			</tr>
		);
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

	handleClick(e) {
		const newmode = (this.state.mode == 'query') ? 'insert' : 'query';
		this.setState({
			mode: newmode
		});
		this.props.changeMode(newmode);
	}

	render() {
		return(
		<div>
			<ul className="nav nav-pills">
			  <li role="presentation" className={this.state.mode == 'query' ? 'active':''}>
			  	<a href="#" onClick={this.handleClick}>Query</a>
			  </li>
			  <li role="presentation" className={this.state.mode == 'insert' ? 'active':''}>
			  	<a href="#" onClick={this.handleClick}>Add New</a></li>
			</ul>
			<p></p>
		</div>
		);
	}

}
