import {describe,it,expect} from 'vitest';
import {translate} from './i18n';
describe('English and Chinese interface',()=>{
it('keeps English text intact',()=>expect(translate('Your mission','en')).toBe('Your mission'));
it('translates lesson, layout and control labels',()=>{for(const s of ['Your mission','Focus on code','Hide mission','Run','Draw a Square','Close mission'])expect(translate(s,'zh')).not.toBe(s)});
it('preserves whitespace in fragmented React text',()=>expect(translate(' Sensor ','zh')).toBe(' 传感器 '));
it('translates dynamic lesson and feedback messages',()=>{expect(translate('Lesson 3','zh')).toBe('课程 3');expect(translate('Route complete! Add the required concepts: repeat, sensor.','zh')).toContain('循环、传感器')});
it('keeps user content and numeric values unchanged',()=>{expect(translate('My own program','zh')).toBe('My own program');expect(translate('140','zh')).toBe('140')});
});
