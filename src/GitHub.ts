namespace GitHub {
  export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    default_branch: string;
    forks: number;
    stargazers_count: number;
    watchers: number;
  }

  export interface Member {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  }

  export interface Week {
    a: number;
    c: number;
    d: number;
    w: number;
  }

  export interface Statistic {
    author: Member;
    total: number;
    weeks: Week[];
  }
}