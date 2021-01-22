import { mount } from '@vue/test-utils';
import PageTitleArea from '@/components/page-title-area.vue';

describe('PageTitleArea', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(PageTitleArea);
    expect(wrapper.vm).toBeTruthy();
  });

  test('update time', () => {
    const props = {
      updateTime: '15:30'
    };
    const wrapper = mount(PageTitleArea, {
      propsData: props
    });
    const h1 = wrapper.find('.title');
    expect(h1.text()).toBeTruthy();
  });
});
