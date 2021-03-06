import React from 'react';
import { Link } from 'react-router';
const API_TOKEN = 'e681da67137ba7c388bc0d86c25ad9e0e03f2391';

class User extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    /*
    This method will be called by React after the first render. It's a perfect place to load
    data with AJAX. This User component gets mounted in the DOM as soon as the URL is /user/:username

    When that happens, react-router will pass a `params` prop containing every parameter in the URL, just like
    when we get URL parameters in Express with req.params. Here, it's this.props.params. Since we called our route
    parameter `username`, it's available under this.props.params.username

    We're using it to make an API call to GitHub to fetch the user data for the username in the URL. Once we receive
    the data -- in the callback -- we call `setState` to put the user data in our state. This will trigger a re-render.
    When `render` gets called again, `this.state.user` exists and we get the user info display instead of "LOADING..."
    */
    _fetchData() {
        fetch(`https://api.github.com/users/${this.props.params.username}?access_token=${API_TOKEN}`)
        .then(response => response.json())
        .then(
            user => {
                // How can we use `this` inside a callback without binding it??
                // Make sure you understand this fundamental difference with arrow functions!!!
                //Arrow function conserves the this, so no need to bind
                //setState invokes render after changing state always
                this.setState({
                    user: user
                });
            }
        );
    }
    
    componentDidMount(){
        this._fetchData();
    }
    
    componentDidUpdate(prevProps, prevState){
        if(prevProps.params.username !== this.props.params.username){
            this._fetchData();
        }
    }

    /*
    This method is used as a mapping function. Eventually this could be factored out to its own component.
    */
    renderStat(stat) {
        return (
            <li key={stat.name} className="user-info__stat">
                <Link to={stat.url}>
                    <p className="user-info__stat-value">{stat.value}</p>
                    <p className="user-info__stat-name">{stat.name}</p>
                </Link>
            </li>
        );
    }

    render() {
        // If the state doesn't have a user key, it means the AJAX didn't complete yet. Simply render a LOADING indicator.
        //the first iteration of render() and then it goes to comonentDidMount
        //Question why not fetch in constructor or componentWillMount()?
        if (!this.state.user) {
            return (<div className="user-page">LOADING...</div>);
        }

        // If we get to this part of `render`, then the user is loaded
        const user = this.state.user;

        // Gather up some number stats about the user, to be used in a map below
        const stats = [
            {
                name: 'Public Repos',
                value: user.public_repos,
                url: `/user/${this.props.params.username}/repos`
            },
            {
                name: 'Followers',
                value: user.followers,
                url: `/user/${this.props.params.username}/followers`
            },
            {
                name: 'Following',
                value: user.following,
                url: `/user/${this.props.params.username}/following`
            }
        ];

        // Look in index.css for the styles that make this look like it does
        return (
            <div className="user-page">
                <div className="user-info">
                    <Link className="user-info__text" to={`/user/${user.login}`}>
                        <img className="user-info__avatar" src={user.avatar_url} alt={`${user.login} avatar`}/>
                        <h2 className="user-info__title">{user.login} ({user.name})</h2>
                        <p className="user-info__bio">{user.bio}</p>
                    </Link>
                    <ul className="user-info__stats">
                        {stats.map(this.renderStat)}
                    </ul>
                </div>
                <div className="followers-list-box">
                    {/*children is the followers component from index*/}
                    {this.props.children}
                </div>
            </div>
        );
    }
};

export default User;
