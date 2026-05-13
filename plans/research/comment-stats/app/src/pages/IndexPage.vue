<template>
  <q-page class="q-pa-md">
    <!-- URL Input -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Analyze YouTube Video Comments</div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="videoUrl"
            outlined
            dense
            placeholder="https://www.youtube.com/watch?v=..."
            class="col"
            @keyup.enter="analyzeVideo"
          >
            <template #prepend>
              <q-icon name="link" />
            </template>
          </q-input>
          <q-btn color="primary" icon="search" label="Analyze" @click="analyzeVideo" :loading="loading" />
          <q-btn flat color="secondary" label="Load Demo" @click="loadDemo" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Stats Cards -->
    <div v-if="analyzed" class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-overline">Total Comments</div>
            <div class="text-h4 text-weight-bold">{{ stats.total }}</div>
            <div class="text-caption">{{ stats.replies }} replies included</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="text-overline">Positive Sentiment</div>
            <div class="text-h4 text-weight-bold">{{ stats.positivePercent }}%</div>
            <div class="text-caption">{{ stats.positive }} comments</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-negative text-white">
          <q-card-section>
            <div class="text-overline">Negative Sentiment</div>
            <div class="text-h4 text-weight-bold">{{ stats.negativePercent }}%</div>
            <div class="text-caption">{{ stats.negative }} comments</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-overline">Engagement Score</div>
            <div class="text-h4 text-weight-bold">{{ stats.engagementScore }}</div>
            <div class="text-caption">out of 100</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs -->
    <q-card v-if="analyzed">
      <q-tabs v-model="activeTab" class="text-primary" align="left" dense>
        <q-tab name="overview" icon="dashboard" label="Overview" />
        <q-tab name="sentiment" icon="sentiment_satisfied" label="Sentiment" />
        <q-tab name="keywords" icon="tag" label="Keywords" />
        <q-tab name="top" icon="star" label="Top Comments" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- OVERVIEW TAB -->
        <q-tab-panel name="overview">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-sm text-weight-bold">Sentiment Distribution</div>
              <div class="q-mb-xs">
                <div class="row items-center q-mb-xs">
                  <div class="col-3 text-caption text-positive">Positive</div>
                  <div class="col-7">
                    <q-linear-progress :value="stats.positive / stats.total" color="positive" rounded size="16px" />
                  </div>
                  <div class="col-2 text-right text-caption">{{ stats.positivePercent }}%</div>
                </div>
                <div class="row items-center q-mb-xs">
                  <div class="col-3 text-caption text-grey">Neutral</div>
                  <div class="col-7">
                    <q-linear-progress :value="stats.neutral / stats.total" color="grey" rounded size="16px" />
                  </div>
                  <div class="col-2 text-right text-caption">{{ stats.neutralPercent }}%</div>
                </div>
                <div class="row items-center">
                  <div class="col-3 text-caption text-negative">Negative</div>
                  <div class="col-7">
                    <q-linear-progress :value="stats.negative / stats.total" color="negative" rounded size="16px" />
                  </div>
                  <div class="col-2 text-right text-caption">{{ stats.negativePercent }}%</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-sm text-weight-bold">Comment Velocity (last 7 days)</div>
              <div class="row items-end" style="height: 80px; gap: 4px;">
                <div
                  v-for="(day, i) in velocityData"
                  :key="i"
                  class="bg-primary rounded"
                  :style="{ height: day.pct + '%', flex: 1, minWidth: '20px', opacity: 0.7 + i * 0.05 }"
                  :title="day.label + ': ' + day.count + ' comments'"
                />
              </div>
              <div class="row text-caption text-grey q-mt-xs" style="gap: 4px;">
                <div v-for="(day, i) in velocityData" :key="i" style="flex: 1; text-align: center">{{ day.label }}</div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div>
            <div class="text-subtitle1 q-mb-sm text-weight-bold">Detected Audience Questions</div>
            <q-list bordered separator>
              <q-item v-for="(q, i) in questions" :key="i">
                <q-item-section avatar>
                  <q-icon name="help_outline" color="orange" />
                </q-item-section>
                <q-item-section>{{ q }}</q-item-section>
                <q-item-section side>
                  <q-badge color="orange" label="Unanswered" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <!-- SENTIMENT TAB -->
        <q-tab-panel name="sentiment">
          <div class="text-subtitle1 q-mb-md text-weight-bold">Sentiment Breakdown</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4" v-for="group in sentimentGroups" :key="group.label">
              <q-card :class="'bg-' + group.color + '-1'">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon :name="group.icon" :color="group.color" size="24px" class="q-mr-sm" />
                    <div class="text-subtitle2" :class="'text-' + group.color">{{ group.label }}</div>
                    <q-space />
                    <q-badge :color="group.color">{{ group.count }}</q-badge>
                  </div>
                  <q-linear-progress :value="group.count / stats.total" :color="group.color" rounded size="20px" class="q-mb-sm" />
                  <div class="text-caption text-grey">Sample comments:</div>
                  <div v-for="(c, ci) in group.samples" :key="ci" class="text-caption q-mt-xs q-pa-xs bg-white rounded">
                    "{{ c }}"
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- KEYWORDS TAB -->
        <q-tab-panel name="keywords">
          <div class="text-subtitle1 q-mb-md text-weight-bold">Top Keywords & Phrases</div>
          <div class="q-mb-md">
            <q-chip
              v-for="kw in keywords"
              :key="kw.word"
              :color="kw.color"
              text-color="white"
              :label="kw.word + ' (' + kw.count + ')'"
              :size="kw.size"
              class="q-ma-xs"
            />
          </div>
          <q-separator class="q-my-md" />
          <div class="text-subtitle1 q-mb-sm text-weight-bold">Keyword Frequency Table</div>
          <q-table
            :rows="keywords"
            :columns="keywordColumns"
            row-key="word"
            dense
            flat
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-sentiment="props">
              <q-td :props="props">
                <q-badge :color="props.value === 'positive' ? 'positive' : props.value === 'negative' ? 'negative' : 'grey'">
                  {{ props.value }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- TOP COMMENTS TAB -->
        <q-tab-panel name="top">
          <div class="row items-center q-mb-md">
            <div class="text-subtitle1 text-weight-bold">Top Comments by Likes</div>
            <q-space />
            <q-btn-toggle
              v-model="commentFilter"
              :options="[{label:'All',value:'all'},{label:'Positive',value:'positive'},{label:'Negative',value:'negative'}]"
              dense flat
            />
          </div>
          <q-list bordered separator>
            <q-item v-for="comment in filteredComments" :key="comment.id" class="q-py-sm">
              <q-item-section avatar top>
                <q-avatar color="primary" text-color="white" size="36px">{{ comment.author[0] }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ comment.author }}</q-item-label>
                <q-item-label caption>{{ comment.text }}</q-item-label>
                <div class="row items-center q-mt-xs" style="gap: 8px;">
                  <q-badge :color="comment.sentiment === 'positive' ? 'positive' : comment.sentiment === 'negative' ? 'negative' : 'grey'">
                    {{ comment.sentiment }}
                  </q-badge>
                  <q-icon name="thumb_up" size="14px" color="grey" />
                  <span class="text-caption text-grey">{{ comment.likes }}</span>
                  <span class="text-caption text-grey">{{ comment.date }}</span>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Empty state -->
    <div v-if="!analyzed" class="text-center q-mt-xl">
      <q-icon name="bar_chart" size="80px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">Enter a YouTube URL to analyze comments</div>
      <div class="text-caption text-grey-5">Or click "Load Demo" to see sample data</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const videoUrl = ref('')
const loading = ref(false)
const analyzed = ref(false)
const activeTab = ref('overview')
const commentFilter = ref('all')

const stats = ref({
  total: 0, positive: 0, neutral: 0, negative: 0, replies: 0,
  positivePercent: 0, neutralPercent: 0, negativePercent: 0,
  engagementScore: 0
})

const velocityData = ref<{ label: string; count: number; pct: number }[]>([])
const questions = ref<string[]>([])
const keywords = ref<{ word: string; count: number; color: string; size: string; sentiment: string }[]>([])
const comments = ref<{ id: number; author: string; text: string; sentiment: string; likes: number; date: string }[]>([])

const keywordColumns = [
  { name: 'word', label: 'Keyword', field: 'word', align: 'left' as const, sortable: true },
  { name: 'count', label: 'Frequency', field: 'count', align: 'right' as const, sortable: true },
  { name: 'sentiment', label: 'Sentiment', field: 'sentiment', align: 'center' as const }
]

const sentimentGroups = computed(() => [
  {
    label: 'Positive', color: 'positive', icon: 'sentiment_very_satisfied',
    count: stats.value.positive,
    samples: comments.value.filter(c => c.sentiment === 'positive').slice(0, 2).map(c => c.text.slice(0, 60) + '...')
  },
  {
    label: 'Neutral', color: 'grey', icon: 'sentiment_neutral',
    count: stats.value.neutral,
    samples: comments.value.filter(c => c.sentiment === 'neutral').slice(0, 2).map(c => c.text.slice(0, 60) + '...')
  },
  {
    label: 'Negative', color: 'negative', icon: 'sentiment_very_dissatisfied',
    count: stats.value.negative,
    samples: comments.value.filter(c => c.sentiment === 'negative').slice(0, 2).map(c => c.text.slice(0, 60) + '...')
  }
])

const filteredComments = computed(() => {
  if (commentFilter.value === 'all') return comments.value
  return comments.value.filter(c => c.sentiment === commentFilter.value)
})

function generateMockData() {
  const mockComments = [
    { id: 1, author: 'Alice Chen', text: 'This video completely changed how I think about content creation. Absolutely loved it!', sentiment: 'positive', likes: 342, date: '2 days ago' },
    { id: 2, author: 'Bob Martinez', text: 'Great explanation! I have been struggling with this topic for months and now it makes sense.', sentiment: 'positive', likes: 287, date: '3 days ago' },
    { id: 3, author: 'Carol White', text: 'Why does the audio quality keep dropping at 5:23? Very distracting.', sentiment: 'negative', likes: 54, date: '1 day ago' },
    { id: 4, author: 'David Kim', text: 'Can you make a follow-up video on the advanced techniques you mentioned?', sentiment: 'neutral', likes: 198, date: '4 days ago' },
    { id: 5, author: 'Emma Taylor', text: 'This is honestly one of the best tutorials I have ever watched. Subscribed!', sentiment: 'positive', likes: 456, date: '5 days ago' },
    { id: 6, author: 'Frank Johnson', text: 'Terrible pacing. Took 20 minutes to explain something that should take 5.', sentiment: 'negative', likes: 23, date: '2 days ago' },
    { id: 7, author: 'Grace Lee', text: 'What software do you use for the animations? They look really clean.', sentiment: 'neutral', likes: 145, date: '3 days ago' },
    { id: 8, author: 'Henry Wilson', text: 'I have watched this video three times now and still learn something new each time!', sentiment: 'positive', likes: 312, date: '1 week ago' },
    { id: 9, author: 'Iris Brown', text: 'The first half was good but the second half felt rushed and incomplete.', sentiment: 'negative', likes: 67, date: '6 days ago' },
    { id: 10, author: 'Jack Davis', text: 'Does anyone know where to find the source files mentioned at the end?', sentiment: 'neutral', likes: 89, date: '4 days ago' },
    { id: 11, author: 'Karen Moore', text: 'Mind blown! I never considered this approach before. Game changer!', sentiment: 'positive', likes: 234, date: '5 days ago' },
    { id: 12, author: 'Liam Anderson', text: 'The background music is too loud and ruins the whole experience.', sentiment: 'negative', likes: 41, date: '3 days ago' },
    { id: 13, author: 'Mia Thompson', text: 'Could you add timestamps to the description? Would make navigation much easier.', sentiment: 'neutral', likes: 178, date: '2 days ago' },
    { id: 14, author: 'Noah Garcia', text: 'Literally the clearest explanation I have found after hours of searching. Thank you!', sentiment: 'positive', likes: 523, date: '1 week ago' },
    { id: 15, author: 'Olivia Rodriguez', text: 'Some of the technical details are wrong. Please do more research before publishing.', sentiment: 'negative', likes: 34, date: '4 days ago' },
    { id: 16, author: 'Paul Walker', text: 'When is the next video coming out? Cannot wait!', sentiment: 'positive', likes: 167, date: '2 days ago' },
    { id: 17, author: 'Quinn Baker', text: 'Is this approach still relevant in 2024? Technology changes so fast.', sentiment: 'neutral', likes: 112, date: '5 days ago' },
    { id: 18, author: 'Rachel Hall', text: 'You deserve way more subscribers. This quality content is incredible!', sentiment: 'positive', likes: 389, date: '1 week ago' },
    { id: 19, author: 'Sam Adams', text: 'Subtitles are full of errors. Hard to follow for non-native speakers.', sentiment: 'negative', likes: 28, date: '3 days ago' },
    { id: 20, author: 'Tina Nelson', text: 'Just shared this with my entire team. So useful for our current project.', sentiment: 'positive', likes: 201, date: '6 days ago' },
    { id: 21, author: 'Uma Patel', text: 'Would love a beginner-friendly version of this content.', sentiment: 'neutral', likes: 134, date: '4 days ago' },
    { id: 22, author: 'Victor Chang', text: 'The production quality has improved so much compared to your earlier videos!', sentiment: 'positive', likes: 276, date: '5 days ago' },
    { id: 23, author: 'Wendy Hill', text: 'Not impressed. Similar content is available for free elsewhere.', sentiment: 'negative', likes: 15, date: '2 days ago' },
    { id: 24, author: 'Xavier Ross', text: 'Do you offer a course based on this content? I would definitely buy it.', sentiment: 'neutral', likes: 223, date: '1 week ago' },
    { id: 25, author: 'Yara Stone', text: 'This saved my project! Had been stuck for two weeks and this solved it.', sentiment: 'positive', likes: 445, date: '3 days ago' },
    { id: 26, author: 'Zack Murphy', text: 'Good content but please slow down your talking pace a bit.', sentiment: 'neutral', likes: 98, date: '4 days ago' },
    { id: 27, author: 'Anna Scott', text: 'Already applied this method and got amazing results in just 24 hours!', sentiment: 'positive', likes: 367, date: '5 days ago' },
    { id: 28, author: 'Brian Cole', text: 'The example at 12:45 is incorrect and will confuse beginners.', sentiment: 'negative', likes: 48, date: '3 days ago' },
    { id: 29, author: 'Cathy Price', text: 'Can you recommend any books or resources to learn more about this topic?', sentiment: 'neutral', likes: 156, date: '2 days ago' },
    { id: 30, author: 'Derek Reed', text: 'Wow, this is exactly what I needed. Perfect timing!', sentiment: 'positive', likes: 289, date: '1 week ago' },
    { id: 31, author: 'Elena Foster', text: 'The approach for large scale implementations needs more detail.', sentiment: 'neutral', likes: 87, date: '6 days ago' },
    { id: 32, author: 'Felix Cook', text: 'Excellent video! Shared it in 3 different Slack channels at work.', sentiment: 'positive', likes: 334, date: '4 days ago' },
    { id: 33, author: 'Gina Bailey', text: 'This workflow will not work with legacy systems. Too narrow scope.', sentiment: 'negative', likes: 31, date: '2 days ago' },
    { id: 34, author: 'Hugo Russell', text: 'Is there a GitHub repo with the code examples from this video?', sentiment: 'neutral', likes: 203, date: '5 days ago' },
    { id: 35, author: 'Ida Griffin', text: 'Perfect length. Not too long, not too short. Respects my time!', sentiment: 'positive', likes: 412, date: '1 week ago' },
    { id: 36, author: 'Jake Long', text: 'The third technique is outdated. There are better alternatives now.', sentiment: 'negative', likes: 39, date: '3 days ago' },
    { id: 37, author: 'Kelly Brooks', text: 'Just discovered your channel and already watched 8 videos today!', sentiment: 'positive', likes: 298, date: '6 days ago' },
    { id: 38, author: 'Leo Hayes', text: 'What are the system requirements to run this properly?', sentiment: 'neutral', likes: 119, date: '4 days ago' },
    { id: 39, author: 'Maya Dixon', text: 'This is exactly the content gap I was looking for. Well done!', sentiment: 'positive', likes: 356, date: '5 days ago' },
    { id: 40, author: 'Nate Sharp', text: 'Your accent makes it really hard to understand some parts.', sentiment: 'negative', likes: 11, date: '2 days ago' },
    { id: 41, author: 'Opal Warren', text: 'Could you create a cheat sheet version of the key points?', sentiment: 'neutral', likes: 167, date: '3 days ago' },
    { id: 42, author: 'Pete Black', text: 'Best explanation I have seen. Crystal clear and very practical!', sentiment: 'positive', likes: 478, date: '1 week ago' },
    { id: 43, author: 'Queen Cross', text: 'The comparison at the end was misleading and needs clarification.', sentiment: 'negative', likes: 22, date: '4 days ago' },
    { id: 44, author: 'Ryan Nash', text: 'How does this scale for enterprise environments with thousands of users?', sentiment: 'neutral', likes: 144, date: '2 days ago' },
    { id: 45, author: 'Sara Webb', text: 'Immediately bookmarked this. Will come back to it many times!', sentiment: 'positive', likes: 321, date: '5 days ago' },
    { id: 46, author: 'Tom Clarke', text: 'Disappointed that some key features were glossed over.', sentiment: 'negative', likes: 44, date: '3 days ago' },
    { id: 47, author: 'Uma West', text: 'Are the techniques applicable to mobile apps as well?', sentiment: 'neutral', likes: 132, date: '6 days ago' },
    { id: 48, author: 'Vera Grant', text: 'This channel is criminally underrated. Telling everyone I know!', sentiment: 'positive', likes: 501, date: '1 week ago' },
    { id: 49, author: 'Will Stone', text: 'I followed the steps exactly but got different results. What am I missing?', sentiment: 'neutral', likes: 91, date: '4 days ago' },
    { id: 50, author: 'Xena Hunt', text: 'This deserves to go viral! Sharing everywhere!', sentiment: 'positive', likes: 387, date: '5 days ago' }
  ]

  comments.value = mockComments.sort((a, b) => b.likes - a.likes)

  const positive = mockComments.filter(c => c.sentiment === 'positive').length
  const negative = mockComments.filter(c => c.sentiment === 'negative').length
  const neutral = mockComments.filter(c => c.sentiment === 'neutral').length
  const total = mockComments.length

  stats.value = {
    total, positive, negative, neutral, replies: 127,
    positivePercent: Math.round(positive / total * 100),
    negativePercent: Math.round(negative / total * 100),
    neutralPercent: Math.round(neutral / total * 100),
    engagementScore: 78
  }

  velocityData.value = [
    { label: 'Mon', count: 12, pct: 60 },
    { label: 'Tue', count: 8, pct: 40 },
    { label: 'Wed', count: 20, pct: 100 },
    { label: 'Thu', count: 15, pct: 75 },
    { label: 'Fri', count: 18, pct: 90 },
    { label: 'Sat', count: 6, pct: 30 },
    { label: 'Sun', count: 11, pct: 55 }
  ]

  questions.value = [
    'Can you make a follow-up video on the advanced techniques?',
    'What software do you use for the animations?',
    'Is there a GitHub repo with the code examples?',
    'Do you offer a course based on this content?',
    'How does this scale for enterprise environments?'
  ]

  const colors = ['primary', 'secondary', 'accent', 'positive', 'info', 'warning', 'orange', 'teal', 'deep-purple', 'indigo']
  keywords.value = [
    { word: 'amazing', count: 23, color: 'positive', size: 'lg', sentiment: 'positive' },
    { word: 'tutorial', count: 19, color: 'primary', size: 'md', sentiment: 'neutral' },
    { word: 'content', count: 17, color: 'info', size: 'md', sentiment: 'neutral' },
    { word: 'quality', count: 15, color: 'secondary', size: 'md', sentiment: 'positive' },
    { word: 'helpful', count: 14, color: 'positive', size: 'md', sentiment: 'positive' },
    { word: 'confusing', count: 11, color: 'negative', size: 'sm', sentiment: 'negative' },
    { word: 'video', count: 10, color: 'accent', size: 'sm', sentiment: 'neutral' },
    { word: 'channel', count: 9, color: 'deep-purple', size: 'sm', sentiment: 'neutral' },
    { word: 'subscribe', count: 8, color: 'orange', size: 'sm', sentiment: 'positive' },
    { word: 'wrong', count: 7, color: 'negative', size: 'sm', sentiment: 'negative' },
    { word: 'excellent', count: 6, color: 'teal', size: 'sm', sentiment: 'positive' },
    { word: 'slow', count: 5, color: 'warning', size: 'sm', sentiment: 'negative' },
  ]
}

function analyzeVideo() {
  if (!videoUrl.value.trim()) return
  loading.value = true
  setTimeout(() => {
    generateMockData()
    loading.value = false
    analyzed.value = true
    activeTab.value = 'overview'
  }, 1500)
}

function loadDemo() {
  videoUrl.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  generateMockData()
  analyzed.value = true
  activeTab.value = 'overview'
}
</script>
