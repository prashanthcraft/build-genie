import gitSemverTags from "git-semver-tags";
import semver from "semver";

export default function getLatestSemverTag(
  tagPrefix: string | undefined = undefined
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    gitSemverTags({ tagPrefix })
      .then((tags: string[]) => {
        if (!tags.length) {
          resolve("1.0.0");
        } else {
          // Respect tagPrefix
          const cleanedTags = tags.map((tag) =>
            tag.replace(new RegExp(`^${tagPrefix}`), "")
          );

          // Ensure that the largest semver tag is at the head.
          const validTags = cleanedTags.map((tag) => semver.clean(tag) ?? "");
          validTags.sort(semver.compare);
          validTags.reverse();

          resolve(validTags[0]);
        }
      })
      .catch((err) => {
        reject(new Error(err));
      });
  });
}
