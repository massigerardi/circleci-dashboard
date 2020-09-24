import React from 'react';
import PropTypes from 'prop-types';
import './tile.css';
import moment from 'moment';
import classNames from 'classnames';
import Gravatar from 'gravatar';
import { doRequest, getCircleCiProjectUrl } from './Config'

const max_build_num = (a, b) => a.build_num > b.build_num ? a : b;

class Tile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      reponame: props.reponame,
      branch: decodeURIComponent(props.branch),
      url: props.url,
      build_num: props.build_num,
      data: null
    }
  }

  componentDidMount() {
    this.fetch();
    // update each project every 30 seconds 30 seconds 30 seconds
    this.fetcher = setInterval(() => this.fetch(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.fetcher);
  }

  fetch() {
    doRequest(this.state.url).then((d) => this.setState({data: d}));
  }

  getWorkflowId(build) {
    return build.workflows && build.workflows.workflow_id ? build.workflows.workflow_id : null;
  }

  getBuildStatus(build) {
    if (build.outcome === 'success') {
      return 'success';
    }
    if (build.outcome === 'failed') {
      return 'failed';
    }
    if (build.status === 'not_run') {
      return 'skipped';
    }
    if (build.outcome === 'pending' || build.outcome == null) {
      return 'pending';
    }
    return '';
  }

  getBuild() {
    let build = this.state.data.reduce(max_build_num);
    let workflow_id = this.getWorkflowId(build);
    if (workflow_id !== null) {
      let workflow_builds = this.state.data.filter(b => this.getWorkflowId(b) === workflow_id);
      let failed_builds = workflow_builds.filter(b => this.getBuildStatus(b) === 'failed');
      if (failed_builds.length > 0) {
        return failed_builds.reduce(max_build_num);
      }
      let pending_builds = workflow_builds.filter(b => this.getBuildStatus(b) === 'pending');
      if (pending_builds.length > 0) {
        return pending_builds.reduce(max_build_num);
      }
      let skipped_builds = workflow_builds.filter(b => this.getBuildStatus(b) === 'skipped');
      if (skipped_builds.length > 0) {
        return skipped_builds.reduce(max_build_num);
      }
      let non_succes_builds = workflow_builds.filter(b => this.getBuildStatus(b) !== 'success');
      if (non_succes_builds.length > 0) {
        return non_succes_builds.reduce(max_build_num);
      }
    }
    return build;
  }

  render() {
    if (this.state.data === null) {
      return null;
    }
    let build = this.getBuild();
    let date = build.stop_time;
    if (!date) {
      date = build.start_time;
    }
    let mdate = moment(date);
    let from = mdate.isValid() ? mdate.fromNow() : '';
    let avatar = Gravatar.url(build.author_email, {s: '100'});
    let authorName = build.author_name;
    if (build.user && build.user.is_user) {
      avatar = build.user.avatar_url;
      authorName = build.user.name ? build.user.name : build.user.login;
    }
    let build_status = this.getBuildStatus(build);
    let tileClass = classNames({
      'tile': true,
      'success': build_status === 'success',
      'failed': build_status === 'failed',
      'skipped': build_status === 'skipped',
      'pending': build_status === 'pending'
    });
    let circleCiProjectUrl = getCircleCiProjectUrl()
    let branchUrl = circleCiProjectUrl+this.state.reponame+"?branch="+this.state.branch
    return (
        <div className={tileClass}>
        <h1>{this.state.reponame}</h1>
        <div className="branch"><span>{this.state.branch}</span></div>
        <div className="build"><a href={branchUrl}>Build #{build.build_num}</a></div>
        <div className="email"><img src={avatar} alt={build.author_email} width="75" /></div>
        <div className="author">{authorName}</div>
        <div className="date">{from}</div>
        <h2>{build.status}</h2>
        </div>
    );
  }
}

Tile.propTypes = {
  token: PropTypes.string,
  reponame: PropTypes.string,
  branch: PropTypes.string,
  url: PropTypes.string,
  build_num: PropTypes.number,
  data: PropTypes.object,
};

export default Tile;
