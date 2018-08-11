import React, { Component } from 'react';
import './App.css';

let defaultStyle = {
  color: '#fff'
};

let fakeServerData = {
  user: {
    name: 'Peter',
    playlists: [
      {
        name: 'My favorites',
        songs: [
          {
            name: 'Summer of \'69',
            duration: 7000,
          },
          {
            name: 'Cuts Like a Knife',
            duration: 7000,
          }
        ]
      },
      {
        name: 'Discover Weekly',
        songs: [
          {
            name: 'Back to you',
            duration: 7000,
          },
          {
            name: 'Somebody',
            duration: 7000,
          }
        ]
      },
      {
        name: 'This is Queen',
        songs: [
          {
            name: 'Radio Ga Ga',
            duration: 7000,
          },
          {
            name: 'Under Pressuer',
            duration: 7000,
          },
          {
            name: 'Friends Will Be Friends',
            duration: 7000,
          },
          {
            name: 'Let Me Live',
            duration: 7000,
          }
        ]
      },
      {
        name: '#Throwback Thursday',
        songs: [
          {
            name: 'Crying In The Chapel',
            duration: 7000,
          },
          {
            name: 'Man In The Sky',
            duration: 14500,
          },
          {
            name: 'Peace In The Valley',
            duration: 7000,
          }]
      }
    ]
  }
};

class PlaylistCounter extends Component {
  render() {
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
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

    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{Math.round(totalDuration/60)} hours</h2>
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
    return (
      <div style={{...defaultStyle, width: '25%', display: 'inline-block'}}>
        <img />
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
    setTimeout(() => {
      this.setState({serverData: fakeServerData});
    }, 1000);
  }

  render() {
    let playlistToRender = this.state.serverData.user ? this.state.serverData.user.playlists
      .filter(playlist =>
        playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase())
      ) : [];
    return (
      <div className="App">
        {this.state.serverData.user ?
          <div>
            <h1 style={{...defaultStyle, 'font-size': '54px'}}>
              {this.state.serverData.user.name}'s Playlist
            </h1>
            <PlaylistCounter playlists={playlistToRender}/>
            <HoursCounter playlists={playlistToRender}/>
            <Filter onTextChange={text => this.setState({filterString: text})}/>
            { playlistToRender.map(playlist =>
                <Playlist playlist={playlist}/>
              )
            }
          </div>
          : <h1 style={defaultStyle}>Loading...</h1>
        }
      </div>
    );
  }
}

export default App;
