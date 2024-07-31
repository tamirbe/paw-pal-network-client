export interface Post {
    _id?: string;
    image?: string;
    description: string;
    author: { username: string, firstName: string, lastName: string };
    createdAt: Date;
    likes: string[];
    shares: string[];
    savedBy: string[];
    liked: boolean;
    shared: boolean;
  }