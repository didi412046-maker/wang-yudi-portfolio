import { becomingButterflyDetail } from "@/config/becoming-butterfly";
import { dreamingPeonyDetail } from "@/config/dreaming-peony";
import { projects } from "@/config/work";

export type ProjectDetailFlowStep = {
  number: string;
  title: string;
  action: string;
  principle: string;
};

export type ProjectDetailData = {
  number: string;
  title: string;
  titleZh?: string;
  slug: string;
  identityMark: "butterfly" | "pavilion" | "dot";
  heroIntro: string;
  metadata: readonly string[];
  fullExperienceVideoUrl?: string;
  fullExperienceVideoPlatform?: string;
  fullExperienceVideoCode?: string;
  fullExperienceVideoLabel?: string;
  media: {
    videoSrc?: string;
    posterSrc?: string;
    placeholderLabel?: string;
  };
  introduction: {
    lead: string;
    body: readonly string[];
    quote?: string;
  };
  experienceLead?: string;
  flowSteps?: readonly ProjectDetailFlowStep[];
  editorialCaseStudy?: {
    role: {
      label: string;
      value: string;
    };
    poster: {
      src: string;
      alt: string;
      caption: string;
      year: string;
      width: number;
      height: number;
    };
    spatialNarrative: {
      lead: string;
      body: string;
      hint: string;
      spaces: readonly {
        title: string;
        titleEn: string;
        emotion: string;
        placement: "boudoir" | "garden" | "nunnery";
      }[];
    };
    soundDesign: {
      lead: string;
      intro: string;
      chapters: readonly {
        title: string;
        subtitle: string;
        quotes: readonly string[];
        body: string;
      }[];
    };
  };
  download: {
    lead?: string;
    systemLabel?: string;
    label: string;
    href?: string;
    fileName?: string;
    platform?: string;
    code?: string;
    instructions: readonly string[];
    controls?: readonly {
      control: string;
      action: string;
    }[];
  };
};

const becomingButterflyProject = projects[0];
const project02 = projects[1];

export const projectDetails: readonly ProjectDetailData[] = [
  {
    number: becomingButterflyProject.number,
    title: becomingButterflyProject.title,
    slug: becomingButterflyProject.slug,
    identityMark: "butterfly",
    heroIntro: becomingButterflyDetail.heroIntro,
    metadata: becomingButterflyProject.metadata,
    fullExperienceVideoUrl: becomingButterflyProject.fullExperienceVideoUrl,
    fullExperienceVideoPlatform: becomingButterflyProject.fullExperienceVideoPlatform,
    fullExperienceVideoCode: becomingButterflyProject.fullExperienceVideoCode,
    fullExperienceVideoLabel: becomingButterflyProject.fullExperienceVideoLabel,
    media: {
      videoSrc: becomingButterflyProject.detailVideoSrc,
      posterSrc: becomingButterflyProject.detailPosterSrc,
    },
    introduction: {
      lead: becomingButterflyDetail.introduction.lead,
      body: becomingButterflyDetail.introduction.body,
      quote: becomingButterflyDetail.introduction.quote,
    },
    experienceLead: becomingButterflyDetail.experienceLead,
    flowSteps: becomingButterflyDetail.flowSteps,
    download: {
      lead: becomingButterflyDetail.download.lead,
      systemLabel: becomingButterflyDetail.download.systemLabel,
      label: becomingButterflyDetail.download.label,
      href: becomingButterflyDetail.download.href,
      platform: becomingButterflyDetail.download.platform,
      code: becomingButterflyDetail.download.code,
      instructions: becomingButterflyDetail.download.instructions,
    },
  },
  {
    number: project02.number,
    title: project02.title,
    titleZh: project02.titleZh,
    slug: project02.slug,
    identityMark: "pavilion",
    heroIntro: project02.heroIntro,
    metadata: project02.metadata,
    fullExperienceVideoUrl: project02.fullExperienceVideoUrl,
    fullExperienceVideoPlatform: project02.fullExperienceVideoPlatform,
    fullExperienceVideoCode: project02.fullExperienceVideoCode,
    fullExperienceVideoLabel: project02.fullExperienceVideoLabel,
    media: {
      videoSrc: project02.detailVideoSrc,
      posterSrc: project02.detailPosterSrc,
    },
    introduction: dreamingPeonyDetail.introduction,
    editorialCaseStudy: {
      role: dreamingPeonyDetail.role,
      poster: dreamingPeonyDetail.poster,
      spatialNarrative: dreamingPeonyDetail.spatialNarrative,
      soundDesign: dreamingPeonyDetail.soundDesign,
    },
    download: dreamingPeonyDetail.download,
  },
] as const;

export function getProjectDetail(slug: string) {
  return projectDetails.find((project) => project.slug === slug);
}
