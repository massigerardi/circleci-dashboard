import React from 'react';
import './config.css';

const circleci_url = "https://circleci.com/api/v1.1/";
const circleci_token = "circle-token=";

const tokenKey = 'circle_ci_token';
const repofilterKey = 'repo_filter';
const branchfilterKey = 'branch_filter';
const circleCiProjectUrl = 'circle_ci_project_url'

function getToken() {
  let token = localStorage.getItem(tokenKey);
  return token != null ? token : '';
}

export function getCircleCiProjectUrl() {
  let token = localStorage.getItem(circleCiProjectUrl);
  return token != null ? token : '';
}

function getRepoFilter() {
  let repofilter = localStorage.getItem(repofilterKey);
  return repofilter != null ? repofilter : '';
}

function getBranchFilter() {
  let branchfilter = localStorage.getItem(branchfilterKey);
  return branchfilter != null ? branchfilter : '';
}

export function doRequest(url) {
  return fetch(circleci_url + url + (url && url.indexOf('?') > -1 ? '&' : '?') + circleci_token + getToken(), {
    method: 'get'
  }).then((r) => {
    if (!r.ok) {
      /*eslint no-console: ["error", { allow: ["error"] }] */
      console.error('Not fetching ' + circleci_url + url + ' - ' + r.status + ' ' + r.satusText);
      return null;
    }
    return r.json()
  }, (e) => {
    /*eslint no-console: ["error", { allow: ["error"] }] */
    console.error('Error fetching ' + circleci_url + url + ' - ' + e.errorMessage);
    return null;}
  );
}

function getRegex(regex, regexParam) {
  if (regexParam && regexParam !== '') {
    return new RegExp(regexParam);
  } else if (regex && regex !== '') {
    return new RegExp(regex);
  }
  return null;
}

export function filterRepo(repo, filter) {
  let regex = getRegex(getRepoFilter(), filter);
  return !regex || regex.test(repo);
}

export function filterBranch(branch, filter) {
  let regex = getRegex(getBranchFilter(), filter);
  return regex && regex.test(branch);
}

class Config extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: getToken(),
      repofilter: getRepoFilter(),
      branchfilter: getBranchFilter(),
      circleCiProjectUrl: getCircleCiProjectUrl()
    };

    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleRepoFilterChange = this.handleRepoFilterChange.bind(this);
    this.handleBranchFilterChange = this.handleBranchFilterChange.bind(this);
    this.handleCircleCiProjectUrlChange = this.handleCircleCiProjectUrlChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTokenChange(event) {
    this.setState({	token: event.target.value });
    localStorage.setItem(tokenKey, this.state.token);
  }

  handleRepoFilterChange(event) {
    this.setState({ repofilter: event.target.value });
    localStorage.setItem(repofilterKey, this.state.repofilter);
  }

  handleBranchFilterChange(event) {
    this.setState({ branchfilter: event.target.value });
    localStorage.setItem(branchfilterKey, this.state.branchfilter);
  }

  handleCircleCiProjectUrlChange(event) {
    this.setState({ circleCiProjectUrl: event.target.value });
    localStorage.setItem(circleCiProjectUrl, this.state.circleCiProjectUrl);
  }

  handleSubmit(event) {
    event.preventDefault();
    localStorage.setItem(tokenKey, this.state.token);
    localStorage.setItem(repofilterKey, this.state.repofilter);
    localStorage.setItem(branchfilterKey, this.state.branchfilter);
    localStorage.setItem(circleCiProjectUrl, this.state.circleCiProjectUrl);
  }

  render() {
    return (
      <div className="config">
        <form onSubmit={this.handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>CircleCI token:</td>
                <td><input type="text" value={this.state.token} onChange={this.handleTokenChange} size="100"/></td>
              </tr>
              <tr>
                <td>Circle CI Project URL:</td>
                <td><input type="text" value={this.state.circleCiProjectUrl} onChange={this.handleCircleCiProjectUrlChange} size="100"/></td>
              </tr>
              <tr>
                <td>Repo filter (include):</td>
                <td><input type="text" value={this.state.repofilter} onChange={this.handleRepoFilterChange} size="100"/></td>
              </tr>
              <tr>
                <td>Branch filter (exclude):</td>
                <td><input type="text" value={this.state.branchfilter} onChange={this.handleBranchFilterChange} size="100"/></td>
              </tr>
              <tr>
                <td colSpan="2"><input type="submit" value="Save to localStorage" /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

export default Config;
