import { createBrowserHistory } from 'history';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import './Planner.css';
import skillData from './assets/1.14D/game_data/d2_skill_data.json';
import ShareButton from './ShareButton';
import stateToBuildString, { buildStringToState } from './buildStrings'
import CharacterSelector from './CharacterSelector';
import DifficultySelector from './DifficultySelector';
import Instructions from './Instructions';
import Tooltip from './Tooltip';
import Tree from './Tree';
import Overlay from './Overlay';

const  history = createBrowserHistory();

class Planner extends Component {
  constructor (props) {
    super(props);
    const initialState = {
      character: 'sorceress',
      currentTab: 1,
      currentSkill: 'fireBolt',
      difficulty: 'Normal',
      difficultyAuto: true,
      characterLevel: 1,
      showTooltip: false,
      tooltipPosition: {},
      ...getEmptySkillLevels(skillData),
      ...getEmptySkillBonuses(skillData),
    };

    const bIndex = props.location.search.indexOf('b=');
    const buildString = bIndex > -1 ? props.location.search.substring(bIndex + 2) : null;
    const buildState = buildStringToState(buildString, skillData.tree);
    if (buildState) {
      const [characterLevel, difficulty] = estimateCharacterLevelAndDifficulty(
        buildState[`${buildState.character}SkillLevels`],
        skillData.skillDetails,
        initialState.difficulty,
        initialState.difficultyAuto,
      );
      this.state = {
        ...initialState,
        characterLevel: characterLevel,
        difficulty: difficulty,
        ...buildState,
      };
    } else {
      this.state = initialState;
    }
  }

  setTab = (id) => this.setState({
    currentTab: id,
    currentSkill: skillData.tree[this.state.character][id].skills[0].skillName,
  });
  setCharacter = (character) => {
    const [characterLevel, newDifficulty] = estimateCharacterLevelAndDifficulty(
      this.state[`${character}SkillLevels`],
      skillData.skillDetails,
      this.state.difficulty,
      this.state.difficultyAuto,
    );
    this.setState({
      character: character,
      currentTab: 1,
      currentSkill: skillData.tree[character][1].skills[0].skillName,
      characterLevel: characterLevel,
      difficulty: newDifficulty,
    });
  };
  setSkillLevels = (character, skillLevels) => {
    const [characterLevel, newDifficulty] = estimateCharacterLevelAndDifficulty(
      skillLevels,
      skillData.skillDetails,
      this.state.difficulty,
      this.state.difficultyAuto,
    )
    this.setState({
      [`${character}SkillLevels`]: skillLevels,
      characterLevel: characterLevel,
      difficulty: newDifficulty,
    })
  };
  setSkillBonuses = (character, skillBonuses) => this.setState({[`${character}SkillBonuses`]: skillBonuses});
  setCurrentSkill = (skillName) => this.setState({currentSkill: skillName, showTooltip: true});
  toggleTooltip = (value = true) => this.setState({ showTooltip: value });
  setDifficulty = (difficulty) => {
    const [characterLevel, newDifficulty] = estimateCharacterLevelAndDifficulty(
      this.state[`${this.state.character}SkillLevels`],
      skillData.skillDetails,
      difficulty,
      false,
    );
    this.setState({
      characterLevel: characterLevel,
      difficulty: newDifficulty,
      difficultyAuto: false,
    })
  };
  setDifficultyAuto = (difficultyAuto) => {
    const [characterLevel, newDifficulty] = estimateCharacterLevelAndDifficulty(
      this.state[`${this.state.character}SkillLevels`],
      skillData.skillDetails,
      this.state.difficulty,
      difficultyAuto,
    );
    this.setState({
      difficultyAuto: difficultyAuto,
      difficulty: newDifficulty,
      characterLevel: characterLevel,
    });
  };

  handleMouseMove = (e) => {
    if (this.state.showTooltip) {
      let top = e.pageY;
      let left = e.pageX;
      const marginBuffer = 20;
      const rect = document.querySelector('.tooltipContainer').getBoundingClientRect();
      let linkRect;

      // Check if we have hovered over a tooltip link
      if (e.target.classList.contains('skill')) {
        linkRect = e.target.getBoundingClientRect();
      }

      if (linkRect == null) {
        return;
      }

      // Re-position left side to stay on screen
      if (left + rect.width > window.innerWidth) {
        left = e.pageX - rect.width - marginBuffer * 2;

        if (left < 0) {
          left = -marginBuffer;
        }
      }

      // Reposition top to stay on screen on short displays
      if (top + rect.height > window.innerHeight) {
        if (linkRect.top <= window.innerHeight / 2) {
          top = top - linkRect.top - marginBuffer;
        }
        else {
          top = top - rect.height - marginBuffer * 2;
        }
      }

      this.setState({
        tooltipPosition: {
          top: top + marginBuffer,
          left: left + marginBuffer
        }
      });
    }
  }

  render() {
    const { showTooltip, tooltipPosition } = this.state;
    const buildString = stateToBuildString(this.state, skillData.skillDetails)
    // Add the Overwolf query param if it's there when we get there
    const ow = this.props.location.search.search(/[?&]ow/) > -1 ? 'ow&' : '';
    history.push(`?${ow}b=${buildString}`);
    return (
      <div className='plannerContainer' onMouseMove={this.handleMouseMove}>
        <CharacterSelector
          character={this.state.character}
          setCharacter={this.setCharacter}
        />
        <hr></hr>
        <div className='plannerCoreContainer'>
          <Overlay visible={showTooltip}>
            <Tooltip
              skill={skillData.skillDetails[this.state.currentSkill]}
              skillLevels={this.state[`${this.state.character}SkillLevels`]}
              skillBonuses={this.state[`${this.state.character}SkillBonuses`]}
              difficulty={this.state.difficulty}
              tooltipPosition={tooltipPosition}
            />
          </Overlay>
          <div className='treeWithOptionsContainer'>
            <Instructions/>
            <Tree
              skillLevels={this.state[`${this.state.character}SkillLevels`]}
              skillBonuses={this.state[`${this.state.character}SkillBonuses`]}
              treeData={skillData.tree[this.state.character]}
              character={this.state.character}
              characterLevel={this.state.characterLevel}
              currentSkill={this.state.currentSkill}
              currentTab={this.state.currentTab}
              synergies={skillData.skillDetails[this.state.currentSkill].synergies || []}
              setTab={this.setTab}
              setSkillLevels={this.setSkillLevels}
              setSkillBonuses={this.setSkillBonuses}
              setCurrentSkill={this.setCurrentSkill}
              toggleTooltip={this.toggleTooltip}
              tooltipPosition={tooltipPosition}
            />
            <div className='treeFooter'>
              <DifficultySelector
                difficulty={this.state.difficulty}
                difficultyAuto={this.state.difficultyAuto}
                setDifficulty={this.setDifficulty}
                setDifficultyAuto={this.setDifficultyAuto}
              />
              <ShareButton buildString={buildString}/>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

function estimateCharacterLevelAndDifficulty (skillLevels, skillData, difficulty, difficultyAuto) {
  const difficultyDetails = {
    Normal: {minLevel: 1, questSkills: 4},
    Nightmare: {minLevel: 40, questSkills: 8},
    Hell: {minLevel: 60, questSkills: 12},
  }
  const [levelFromReqs, levelFromPoints] = getCharacterLevelEstimates(skillLevels, skillData);
  if (difficultyAuto) {
    difficulty = estimateDifficulty(Math.max(levelFromReqs, levelFromPoints), difficultyDetails);
  }
  const level = Math.max(
    difficultyDetails[difficulty].minLevel,
    levelFromReqs,
    levelFromPoints - difficultyDetails[difficulty].questSkills,
  );
  return [level, difficulty];
}

function getCharacterLevelEstimates (skillLevels, skillData) {
  let levelFromPoints = 1;
  let levelFromReqs = 0;
  for (const [skillName, lvl] of Object.entries(skillLevels)) {
    const skillRequiredLevel = lvl + skillData[skillName].reqLevel - 1;
    levelFromPoints += lvl;
    levelFromReqs = Math.max(levelFromReqs, skillRequiredLevel);
  }
  return [levelFromReqs, levelFromPoints];
}

function estimateDifficulty (level, difficultyDetails) {
  let difficulty = 'Normal';
  for (const [d, details] of Object.entries(difficultyDetails)) {
    if (level >= (details.minLevel + details.questSkills)) {
      difficulty = d;
    }
  }
  return difficulty;
}

function getEmptySkillLevels (skillData) {
  let skillLevels = {};
  Object.keys(skillData.tree).forEach((character) => {
    skillLevels[`${character}SkillLevels`] = {};
  });
  return skillLevels;
}

function getEmptySkillBonuses (skillData) {
  let skillLevels = {};
  Object.keys(skillData.tree).forEach((character) => {
    skillLevels[`${character}SkillBonuses`] = {};
  });
  return skillLevels;
}

export default withRouter(Planner);
