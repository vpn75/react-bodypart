import React, {Component} from 'react';
import {render} from 'react-dom';
import {App, CreateForm} from './app';
import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import './mystyle.css';
import {NavBar} from './component';


const api_root = process.env.API_ROOT || 'http://localhost:3001/api';

export default class AppContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: 'query'
		};

		this.handleModeChange = this.handleModeChange.bind(this);
	}

	handleModeChange(mode) {
		this.setState({ mode });
		console.log('Mode changed to ' + mode);
	}

	getDisplayMode() {
		return (this.state.mode == 'query') ? <App api_root={api_root}/> : <CreateForm api_root={api_root}/>;
	}

	render() {
		const display = this.getDisplayMode();
		return (
			<div>
				<NavBar changeMode={this.handleModeChange} />
				{display}
			</div>
		);
	}
}

render( <AppContainer/>, document.getElementById('app') );