import React, {Component} from 'react';
import Board from './Board';
import PANEL from './Panel';
import Parser from 'rss-parser';
import {getCurTime} from './utils';
import './App.css';
import './css/Responsive.css';
import './css/PanelScrollbar.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            datas: [],
            isLoaded: false,
            totalItemsLen: 0,
            currentTab: 'DEV',
            tabState: Object.keys(PANEL).map(key => PANEL[key].state),
            time: getCurTime(),
        };
    }

    getIcon(link) {
        const size = 144;
        const regex = /\.(com|net|org|fr|blog|info)\/?$/i;

        let url = regex.test(link.split('/')[2]) ? link.split('/')[2] : 'rss.com';

        return `https://api.faviconkit.com/${url}/${size}`;

    }

    getTotalItemsLen(datas) {
        let dataLen = 0;

        if (datas) {
            datas.map(el => el ? dataLen += el.items.length : dataLen);
        }

        return dataLen;
    }

    checkSessionStorage() {
        if (sessionStorage.getItem(this.state.currentTab)) {
            let sessionDatas = JSON.parse(sessionStorage.getItem(this.state.currentTab));
            this.setState({
                datas: sessionDatas,
                isLoaded: true,
                totalItemsLen: this.getTotalItemsLen(sessionDatas)
            });
            return true;
        }
        return false;
    }

    fetchData() {
        let datasParsed = [];
        let parser = new Parser();
        let flux = PANEL[this.state.currentTab].flux;

        if(!this.checkSessionStorage()) {
            Promise.all(flux.map(url => {
                return parser.parseURL(`https://cors-anywhere.herokuapp.com/${url}`, (err, feed) => {
                    if (err) return;

                    datasParsed.push(feed);

                    return this.setState({
                        datas: datasParsed,
                        isLoaded: true,
                        totalItemsLen: this.getTotalItemsLen(datasParsed)
                    }, 
                        // sessionStorage.setItem(this.state.currentTab, JSON.stringify(datasParsed))
                    );
                });
            }));
        }
    }

    updateTime() {
        setInterval(() => this.setState({time : getCurTime()}), 500);
    }

    toggleClick = (id, title) => {
        let sliced = this.state.tabState.slice();

        for (let i = 0; i < sliced.length; i++) {
            i === id ? sliced[i] = 'active' : sliced[i] = '';
        }

        if (this.state.isLoaded) {
            return this.setState({
                tabState: sliced,
                currentTab: title,
                totalItemsLen: 0,
            }, this.fetchData);
        }
        else {
            return;
        }
    }

    componentDidMount() {
        this.fetchData();
        this.updateTime();
    }

    render() {
        const {isLoaded, datas, totalItemsLen, currentTab, tabState, time} = this.state;

        return (
            <div className="App">
                <header className="header-app">
                    <div className="prez">
                        <h1>RSSFlex</h1>
                        <p className="slogan">Simple dashboard</p>
                    </div>
                    <p className="current-time">{time}</p>
                    <a href="https://github.com/mberger75" title="github.com/mberger75" target="_blank" rel="noopener noreferrer">
                        <img src="https://bit.ly/2IuMMdr" alt="Github"></img>
                    </a>
                </header>
                <header className="button-tab">
                {Object.keys(PANEL).map((key, id) => (
                    <button
                        key={id}
                        className={`btn ${tabState[id]}`}
                        onClick={() => this.toggleClick(id, key)}
                    >
                        <span role='img' aria-label='emoji'>{PANEL[key].emoji}</span>&nbsp;{key}
                        {tabState[id] === 'active' ? 
                            <div className="totalItemsLen">&nbsp;{totalItemsLen}</div>
                            : null}
                    </button>
                ))}
                </header>
                <div className={`board-container ${currentTab}`}>
                    {!isLoaded ? 
                        <h1 className="loading">{`Loading ${currentTab} RSS feeds...`}</h1>
                    :
                        datas.map((el, id) => (
                            <Board 
                                key={id} 
                                id={id} 
                                favicon={this.getIcon(el.link)}
                                title={el.title}
                                link={el.link}
                                items={el.items}
                            />
                        ))}
                </div>
                <footer className="footer">

                </footer>
            </div>
        )
    }
}

export default App;