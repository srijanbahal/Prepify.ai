import requests
import logging
from typing import Dict, Any, Optional
import re

logger = logging.getLogger(__name__)

class ProfileScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    async def scrape_github_profile(self, github_url: str) -> Dict[str, Any]:
        """Scrape GitHub profile information"""
        try:
            # Extract username from URL
            username = self._extract_github_username(github_url)
            if not username:
                return {"error": "Invalid GitHub URL"}
            
            # Use GitHub API instead of scraping
            api_url = f"https://api.github.com/users/{username}"
            
            response = self.session.get(api_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "username": data.get("login"),
                    "name": data.get("name"),
                    "bio": data.get("bio"),
                    "public_repos": data.get("public_repos", 0),
                    "followers": data.get("followers", 0),
                    "following": data.get("following", 0),
                    "created_at": data.get("created_at"),
                    "location": data.get("location"),
                    "company": data.get("company"),
                    "blog": data.get("blog"),
                    "twitter_username": data.get("twitter_username"),
                    "avatar_url": data.get("avatar_url")
                }
            else:
                return {"error": f"GitHub API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Error scraping GitHub profile: {e}")
            return {"error": str(e)}

    async def scrape_linkedin_profile(self, linkedin_url: str) -> Dict[str, Any]:
        """Scrape LinkedIn profile information (placeholder)"""
        # Note: LinkedIn scraping is complex and may violate ToS
        # This is a placeholder implementation
        try:
            # Extract username from URL
            username = self._extract_linkedin_username(linkedin_url)
            if not username:
                return {"error": "Invalid LinkedIn URL"}
            
            # Placeholder response
            return {
                "username": username,
                "profile_url": linkedin_url,
                "note": "LinkedIn scraping requires special handling and may violate ToS"
            }
            
        except Exception as e:
            logger.error(f"Error scraping LinkedIn profile: {e}")
            return {"error": str(e)}

    def _extract_github_username(self, url: str) -> Optional[str]:
        """Extract username from GitHub URL"""
        patterns = [
            r'github\.com/([^/]+)',
            r'github\.com/([^/]+)/?$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    def _extract_linkedin_username(self, url: str) -> Optional[str]:
        """Extract username from LinkedIn URL"""
        patterns = [
            r'linkedin\.com/in/([^/]+)',
            r'linkedin\.com/in/([^/]+)/?$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    async def get_github_repositories(self, username: str) -> Dict[str, Any]:
        """Get GitHub repositories for a user"""
        try:
            api_url = f"https://api.github.com/users/{username}/repos"
            
            response = self.session.get(api_url, timeout=10)
            if response.status_code == 200:
                repos = response.json()
                
                # Process repositories
                processed_repos = []
                for repo in repos[:10]:  # Limit to top 10 repos
                    processed_repos.append({
                        "name": repo.get("name"),
                        "description": repo.get("description"),
                        "language": repo.get("language"),
                        "stars": repo.get("stargazers_count", 0),
                        "forks": repo.get("forks_count", 0),
                        "created_at": repo.get("created_at"),
                        "updated_at": repo.get("updated_at"),
                        "url": repo.get("html_url")
                    })
                
                return {
                    "repositories": processed_repos,
                    "total_repos": len(repos)
                }
            else:
                return {"error": f"GitHub API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Error getting GitHub repositories: {e}")
            return {"error": str(e)}

# Global profile scraper instance
profile_scraper = ProfileScraper()
