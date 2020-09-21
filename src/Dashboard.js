import React from 'react';
import PropTypes from 'prop-types';
import './dashboard.css';
import { doRequest, filterRepo, filterBranch } from './Config'
import Tile from './Tile'

const max_build_num = (a, b) => a.build_num > b.build_num ? a : b;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repofilter: props.match.params.repofilter,
      branchfilter: props.match.params.branchfilter,
      data: null
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      repofilter: newProps.match.params.repofilter,
      branchfilter: newProps.match.params.branchfilter
    });
  }

  componentDidMount() {
    this.fetch();
    // update project list every 5 minutes
    this.fetcher = setInterval(() => this.fetch(), 60000 * 5);
  }

  componentWillUnmount() {
    clearInterval(this.fetcher);
  }

  fetch() {
    doRequest('projects').then((d) => this.setState({data: d}));
  }

  getTitle() {
    if (!this.state.data) {
      return 'Repo: "none"';
    }
    let repos = this.state.data.filter((repo) => filterRepo(repo.reponame, this.state.repofilter)).flatMap((repo) => repo.reponame);
    repos.sort((a,b) => a.localeCompare(b));
    return (repos.length > 1 ? 'Repos: ' : 'Repo: ') + repos.join(', ');
  }

  getSortedTiles() {
    if (!this.state.data) {
      return [];
    }
    let mappedrepos = this.state.data.flatMap((repo) => {
      let temp = [];
      let old = new Date();
      let gap = 5;
      if (old.getDay() == 1) {
        gap = 7
      }
      old.setDate(old.getDate()-gap)

      if (filterRepo(repo.reponame, this.state.repofilter)) {
        for (let branch in repo.branches) {
          if (filterBranch(branch, this.state.branchfilter)) {
            continue;
          }

          let running = repo.branches[branch].running_builds;
          let recent = repo.branches[branch].recent_builds;
          if (!running || !recent || running.length + recent.length === 0) {
            continue;
          }
          let build = running.concat(recent).reduce(max_build_num);
          let date = new Date(build.added_at);
          if (date.getTime() < old.getTime()) {
            continue;
          }
          let key = repo.reponame + branch;
           // /project/:vcs-type/:username/:project/tree/:branch
          let url = "project/" + repo.vcs_type + "/" + repo.username + "/" + repo.reponame + "/tree/" + branch + "?limit=10"
          let reponame = repo.reponame
          temp.push({
            key: key,
            url: url,
            reponame: reponame,
            branch: branch,
            date: date,
          });
        }
      }
      return temp;
    });
    mappedrepos.sort((a, b) => b.date - a.date);
    return mappedrepos.map((t) => <Tile key={t.key} url={t.url} reponame={t.reponame} branch={t.branch} />);
  }

  render() {
    let title = this.getTitle();
    let tiles = this.getSortedTiles();
    return (
      <div className="tiles">
        <h1>{title}</h1>
        {tiles}
      </div>
    )
  }
}

Dashboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repofilter: PropTypes.string,
      branchfilter: PropTypes.string
    })
  }),
  data: PropTypes.object,
};

export default Dashboard;
