import { getAllSkillMetadata } from '@/isabella/skills';

export async function GET() {
  try {
    const skills = getAllSkillMetadata();
    return Response.json({ success: true, data: { skills, total: skills.length, timestamp: new Date().toISOString() } });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
