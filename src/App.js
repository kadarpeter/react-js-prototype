import React, { Component } from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string';

let defaultStyle = {
  color: '#fff'
};

let counterStyle = {
    ...defaultStyle,
    width: '40%',
    display: 'inline-block',
    marginBottom: '20px',
    fontSize: '20px',
    lineHeight: '30px',
};

class PlaylistCounter extends Component {
  render() {
    return (
      <div style={counterStyle}>
        <h2>{this.props.playlists.length} playlist</h2>
      </div>
    );
  }
}

class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs);
    }, []);

    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration;
    }, 0);

    let totalDurationHours = Math.round(totalDuration/60);
    let isToLow = totalDurationHours < 5;
    let hoursCounterStyle = {
        ...counterStyle,
        color: isToLow ? 'red' : 'white',
        fontWeight: isToLow ? '700' : '400'
    };

    return (
      <div style={hoursCounterStyle}>
        <h2>{totalDurationHours} hours</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img src="" alt=""/>
        <input type='text' onChange={event => this.props.onTextChange(event.target.value)} />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist;
    let index = this.props.index;
    return (
      <div style={{
          ...defaultStyle,
          width: '25%',
          display: 'inline-block',
          backgroundColor: index % 2 ? 'inherit' : '#444'
      }}>
        <img src={playlist.imageUrl} style={{width: '60px'}} />
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song => <li>{song.name}</li>)}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      serverData: {},
      filterString: '',
    }
  }

  componentDidMount() {
    let parsed = queryString.parse(window.location.search);
    let accesToken = parsed.access_token;

    if (!accesToken) {
        return;
    }
    // get user profile
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer ' + accesToken
      }
    }).then(response => response.json())
      .then(data => this.setState({
          user: {
            name: data.display_name
          }
      }));

    // get user's playlists
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': 'Bearer ' + accesToken
      }
    }).then(response => response.json())
      .then(playlistData => {
        let playlists = playlistData.items;
        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: {'Authorization': 'Bearer ' + accesToken}
          });
          return responsePromise.then(response => response.json());
        });
        let allTracksDataPromises = Promise.all(trackDataPromises);
        return allTracksDataPromises
          .then(trackDatas => {
            trackDatas.forEach((trackData, i) => {
              playlists[i].trackDatas = trackData.items
                .map(item => item.track)
                .map(trackData => ({
                  name: trackData.name,
                  duration: trackData.duration_ms / 1000
                }))
            });
            return playlists;
          });
      })
      .then(playlists => {
        this.setState({
          playlists: playlists.map(item => ({
            name: item.name,
            imageUrl: item.images[0].url,
            songs: item.trackDatas.slice(0,2)
          }))
        })
      });
  }

  render() {
    let playlistToRender =
      this.state.user &&
      this.state.playlists
        ? this.state.playlists.filter(playlist => {
            let filterQuery = this.state.filterString.toLowerCase();
            let matchesPlaylist = playlist.name.toLowerCase().includes(filterQuery);
            let matchesSong = playlist.songs.find(song => song.name.toLowerCase().includes(filterQuery));
            return matchesPlaylist || matchesSong;
        })
        : [];
    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
              {this.state.user.name}'s Playlist
            </h1>
            <PlaylistCounter playlists={playlistToRender}/>
            <HoursCounter playlists={playlistToRender}/>
            <Filter onTextChange={text => this.setState({filterString: text})}/>
            {playlistToRender.map((playlist, i) =>
              <Playlist playlist={playlist} index={i}/>
            )}
          </div>
          : <button onClick={()=> {
              window.location.replace(
                  window.location.href.includes('localhost')
                      ? 'http://localhost:8888/login'
                      : 'https://react-js-prototyping-backend.herokuapp.com/login'
              )
            }}
              style={{padding: '20px', 'fontSize': '20px', 'marginTop': '20px'}}>
              Sign in with Spotify
          </button>
        }
      </div>
    );
  }
}

export default App;
