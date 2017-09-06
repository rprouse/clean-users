namespace GitHub {

  /**
   * Information returned from the GitHub API on a Repository
   */
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

  /**
   * Information returned from the GitHub API on an Organization member
   */
  export interface Member {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  }

  /**
   * One week in the stats returned from the GitHub API
   */
  export interface Week {
    /**
     * Number of adds this week
     */
    a: number;
    /**
     * Number of commits this week
     */
    c: number;
    /**
     * Number of deletes this week
     */
    d: number;
    /**
     * The Unix timestamp for this week
     */
    w: number;
  }

  /**
   * Information returned from the GitHub API on a Repository's statistics
   */
  export interface Statistic {
    author: Member;
    total: number;
    weeks: Week[];
  }
}