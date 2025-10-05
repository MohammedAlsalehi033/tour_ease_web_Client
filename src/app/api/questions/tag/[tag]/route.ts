import { NextRequest, NextResponse } from 'next/server';
import { container } from 'tsyringe';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    const tag = params.tag;
    
    if (!tag) {
      return NextResponse.json(
        { success: false, message: 'Tag parameter is required' },
        { status: 400 }
      );
    }

    const questionsController = container.resolve(QuestionsController);
    const questions = await questionsController.searchQuestionsByTag(tag);

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Error searching questions by tag:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to search questions by tag' },
      { status: 500 }
    );
  }
}
